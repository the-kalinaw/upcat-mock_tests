// src/quizLogic.js
// Contains the core logic for the quiz: loading, displaying, submitting, and showing results.

import { fetchQuizData } from './api.js';
import {
  getState, setCorrectAnswers, setTotalQuestions, setQuizQuestionsBySubject,
  setUserAnswers, updateUserAnswer, setTimeLeft, resetAllState
} from './state.js';
import {
  quizContainer, loadingMessage, header, backBtn, submitQuizBtn,
  startMenu, timerElement, progressBarContainer, progressBar, resultsDiv,
  quizCategorySelect, dailyOptionsContainer, dailyWeekSelect, dailyDaySelect,
  unitOptionsContainer, unitSelect, startQuizBtn
} from './domElements.js';
import { startTimer, stopTimer } from './timer.js';
import { showElement, hideElement, customAlert } from './utils.js';
import { QUIZ_DURATION_SECONDS } from './config.js'; // Import quiz duration for reset

/**
 * Fetches data from Google Sheets and initializes the quiz.
 * @param {string} sheetName - The name of the sheet to load.
 */
export async function loadQuiz(sheetName) {
  // Hide start menu and show loading message
  hideElement(startMenu);
  showElement(loadingMessage);

  // Hide all quiz elements initially
  hideElement(header);
  hideElement(quizContainer);
  hideElement(submitQuizBtn);
  hideElement(resultsDiv);
  hideElement(backBtn);

  const rawData = await fetchQuizData(sheetName);

  if (!rawData) {
    // Error already handled by fetchQuizData, just go back to start menu
    goBackToStartMenu();
    return;
  }

  const headers = rawData[0];
  const rawQuestions = rawData.slice(1).map(row => {
    const q = {};
    headers.forEach((h, i) => q[h] = row[i]);
    return q;
  });

  if (rawQuestions.length === 0) {
    customAlert("No questions found in the selected sheet. Please check the sheet content.");
    goBackToStartMenu();
    return;
  }

  // Reset all state variables for a new quiz
  resetAllState();
  setTimeLeft(QUIZ_DURATION_SECONDS); // Set initial time for the new quiz

  const newCorrectAnswers = [];
  const newQuizQuestionsBySubject = {};
  let globalQuestionIndex = 0; // Only counts actual questions, not passages

  rawQuestions.forEach((q) => {
    // Determine if this row is a passage text (no choices, no answer, but has question text)
    const isPassage = !q.ID;
    const subject = q.Subject ? q.Subject.trim() : "Uncategorized";

    if (!newQuizQuestionsBySubject[subject]) {
      newQuizQuestionsBySubject[subject] = [];
    }

    const currentItem = {
      isPassageText: isPassage,
      question: q.Question,
      A: q.A,
      B: q.B,
      C: q.C,
      D: q.D,
    };

    if (isPassage) {
      currentItem.questionIndex = -1;
    } else {
      currentItem.questionIndex = globalQuestionIndex;
      // Only store correct answers for actual questions
      const correctAnswer = q.Answer ? q.Answer.trim().toUpperCase() : '';
      newCorrectAnswers[globalQuestionIndex] = correctAnswer;
      globalQuestionIndex++;
    }

    newQuizQuestionsBySubject[subject].push(currentItem);
  });

  setCorrectAnswers(newCorrectAnswers);
  setTotalQuestions(globalQuestionIndex); // Only count actual questions
  setQuizQuestionsBySubject(newQuizQuestionsBySubject);

  // Successfully loaded data, now update the UI
  hideElement(loadingMessage);
  showElement(header, 'flex');
  showElement(quizContainer);
  showElement(submitQuizBtn);
  showElement(backBtn);

  displayQuestions(newQuizQuestionsBySubject);
  startTimer();
  updateProgress(); // Initialize progress bar
}

/**
 * Displays quiz questions on the page, grouped by subject.
 * @param {object} questionsBySubject - An object with subjects as keys and arrays of question objects as values.
 */
function displayQuestions(questionsBySubject) {
  quizContainer.innerHTML = ""; // Clear old questions

  // Create a form element to wrap all questions for easier submission and event handling
  const quizForm = document.createElement('form');
  quizForm.id = 'quizForm';
  quizContainer.appendChild(quizForm);

  let questionDisplayCounter = 0; // For numbering only real questions

  // Iterate over subjects and their questions
  for (const subject in questionsBySubject) {
    const subjectItems = questionsBySubject[subject];
    if (subjectItems.length === 0) continue; // Skip empty subjects

    const subjectSection = document.createElement("div");
    subjectSection.className = "subject-section";
    subjectSection.innerHTML = `<h2>${subject}</h2>`; // Subject heading

    subjectItems.forEach((item) => {
      if (item.isPassageText) {
        const div = document.createElement("div");
        div.className = "passage-text";
        div.innerHTML = `<p>${item.question}</p>`;
        subjectSection.appendChild(div);
      } else {
        questionDisplayCounter++;
        const div = document.createElement("div");
        div.className = "question";
        div.innerHTML = `
          <p><strong>${questionDisplayCounter}. ${item.question}</strong></p>
          ${item.A ? `<label><input type="radio" name="q${item.questionIndex}" value="A"> A. ${item.A}</label>` : ''}
          ${item.B ? `<label><input type="radio" name="q${item.questionIndex}" value="B"> B. ${item.B}</label>` : ''}
          ${item.C ? `<label><input type="radio" name="q${item.questionIndex}" value="C"> C. ${item.C}</label>` : ''}
          ${item.D ? `<label><input type="radio" name="q${item.questionIndex}" value="D"> D. ${item.D}</label>` : ''}
        `;
        subjectSection.appendChild(div);
      }
    });
    quizForm.appendChild(subjectSection);
  }

  if (window.MathJax) {
    window.MathJax.typesetPromise();
  }

  // Add a single event listener to the form for all radio button changes.
  // This is more efficient than adding a listener to each radio button.
  quizForm.addEventListener("change", (event) => {
    if (event.target.type === 'radio' && event.target.name.startsWith('q')) {
      const questionIndex = parseInt(event.target.name.substring(1));
      updateUserAnswer(questionIndex, event.target.value);
      updateProgress();
    }
  });
}

/**
 * Updates the progress bar based on answered questions.
 */
export function updateProgress() {
  const { userAnswers, totalQuestions } = getState();
  const answeredCount = Object.keys(userAnswers).length;
  const percent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  progressBar.style.width = percent + "%";
  progressBarContainer.setAttribute("aria-valuenow", percent);
}

/**
 * Handles quiz submission, scoring, and displaying results.
 */
export function submitQuiz() {
  // Use customAlert instead of confirm
  const userConfirmed = window.confirm("Are you sure you want to submit your answers?");
  if (!userConfirmed) return;

  stopTimer(); // Stop timer

  const { correctAnswers, totalQuestions, userAnswers, quizQuestionsBySubject } = getState();

  let overallScore = 0;
  let subjectScores = {}; // To store scores per subject
  let subjectTotalQuestions = {}; // To store total questions per subject
  let questionDetails = []; // To store details of all questions (correct, incorrect, unanswered)

  // Initialize subject scores and total questions
  for (const subject in quizQuestionsBySubject) {
    subjectScores[subject] = 0;
    subjectTotalQuestions[subject] = quizQuestionsBySubject[subject].filter(item => !item.isPassageText).length;
  }

  for (let i = 0; i < totalQuestions; i++) {
    const selectedAnswer = userAnswers[i];
    const correct = correctAnswers[i];

    // Find the question details using its global index
    let currentQuestion = null;
    let questionSubject = "Uncategorized";
    for (const subject in quizQuestionsBySubject) {
      currentQuestion = quizQuestionsBySubject[subject].find(q => q.questionIndex === i);
      if (currentQuestion) {
        questionSubject = subject;
        break;
      }
    }

    if (selectedAnswer) {
      if (selectedAnswer === correct) {
        overallScore += 1; // Correct answer: +1 point
        subjectScores[questionSubject] += 1;
        questionDetails.push({
          questionIndex: i,
          question: currentQuestion.question,
          userAnswer: selectedAnswer,
          correctAnswer: correct,
          explanation: currentQuestion.explanation,
          choices: { A: currentQuestion.A, B: currentQuestion.B, C: currentQuestion.C, D: currentQuestion.D },
          subject: questionSubject,
          status: 'correct'
        });
      } else {
        overallScore -= 0.25; // Incorrect answer: -0.25 points
        subjectScores[questionSubject] -= 0.25;
        questionDetails.push({
          questionIndex: i,
          question: currentQuestion.question,
          userAnswer: selectedAnswer,
          correctAnswer: correct,
          explanation: currentQuestion.explanation,
          choices: { A: currentQuestion.A, B: currentQuestion.B, C: currentQuestion.C, D: currentQuestion.D },
          subject: questionSubject,
          status: 'incorrect'
        });
      }
    } else {
      // Unanswered: 0 points (no change to score)
      questionDetails.push({
        questionIndex: i,
        question: currentQuestion.question,
        userAnswer: "N/A",
        correctAnswer: correct,
        explanation: currentQuestion.explanation,
        choices: { A: currentQuestion.A, B: currentQuestion.B, C: currentQuestion.C, D: currentQuestion.D },
        subject: questionSubject,
        status: 'unanswered'
      });
    }
  }

  displayResults(overallScore, totalQuestions, subjectScores, subjectTotalQuestions, questionDetails);

  // Hide quiz elements after submission
  hideElement(quizContainer);
  hideElement(submitQuizBtn);
  hideElement(backBtn);
  hideElement(header); // Hide header after quiz submission
}

/**
 * Displays the quiz results, including overall score, subject scores, and detailed answers.
 * @param {number} overallScore - The user's total score.
 * @param {number} totalQuestions - The total number of questions in the quiz.
 * @param {object} subjectScores - An object containing scores per subject.
 * @param {object} subjectTotalQuestions - An object containing total questions per subject.
 * @param {Array<object>} questionDetails - An array of objects with details for all questions (correct, incorrect, unanswered).
 */
function displayResults(overallScore, totalQuestions, subjectScores, subjectTotalQuestions, questionDetails) {
  resultsDiv.innerHTML = ""; // Clear old results
  showElement(resultsDiv);

  resultsDiv.innerHTML += `<h2>Results:</h2>`;
  const overallScoreDisplay = Number.isInteger(overallScore) ? overallScore : overallScore.toFixed(2);
  resultsDiv.innerHTML += `<h3>Your Overall Score: ${overallScoreDisplay} / ${totalQuestions}</h3>`;

  // Display scores per subject
  resultsDiv.innerHTML += `<h3>Scores by Subject:</h3>`;
  for (const subject in subjectScores) {
    const subjectScore = subjectScores[subject];
    const subjectScoreDisplay = Number.isInteger(subjectScore) ? subjectScore : subjectScore.toFixed(2);
    resultsDiv.innerHTML += `<p>${subject}: ${subjectScoreDisplay} / ${subjectTotalQuestions[subject]}</p>`;
  }

  // Display detailed answers, grouped by subject
  resultsDiv.innerHTML += `<h3>Detailed Answers:</h3>`;

  // Group all questions by subject for display
  const groupedBySubject = questionDetails.reduce((acc, q) => {
    if (!acc[q.subject]) {
      acc[q.subject] = [];
    }
    acc[q.subject].push(q);
    return acc;
  }, {});

  for (const subject in groupedBySubject) {
    const subjectSection = document.createElement("div");
    subjectSection.className = "subject-results-section";
    subjectSection.innerHTML = `<h4>${subject}</h4>`;

    groupedBySubject[subject].forEach(q => {
      const questionResultDiv = document.createElement("div");
      questionResultDiv.className = "question-result-div";

      const userAnswerText = q.userAnswer !== "N/A" ? q.choices[q.userAnswer] : "";
      const correctAnswerText = q.choices[q.correctAnswer];

      let statusHtml = '';
      if (q.status === 'unanswered') {
        statusHtml = `<span class="unanswered">❗ Unanswered</span>`;
      } else if (q.status === 'incorrect') {
        statusHtml = `<span class="incorrect">❌ Incorrect</span>`;
      } else if (q.status === 'correct') {
        statusHtml = `<span class="correct">✅ Correct</span>`;
      }

      questionResultDiv.innerHTML = `
        <p><strong>${q.questionIndex + 1}. ${q.question}</strong></p>
        <p>Your Answer: ${q.userAnswer !== "N/A" ? q.userAnswer + ". " + userAnswerText : "N/A"} ${statusHtml}</p>
        <p>Correct Answer: ${q.correctAnswer}. ${correctAnswerText}</p>
      `;
      subjectSection.appendChild(questionResultDiv);
    });
    resultsDiv.appendChild(subjectSection);
  }

  if (window.MathJax) {
  window.MathJax.typesetPromise();
  }

  // Add a button to go back to the start menu from results
  const backToStartBtn = document.createElement('button');
  backToStartBtn.textContent = 'Go Back to Start Menu';
  backToStartBtn.style.marginTop = '20px';
  backToStartBtn.addEventListener('click', goBackToStartMenu);
  resultsDiv.appendChild(backToStartBtn);

  // Scroll to the top of the page after results are displayed
  window.scrollTo(0, 0);
}

/**
 * Resets the UI and state to show the start menu.
 */
export function goBackToStartMenu() {
  // Hide all active quiz/results elements
  hideElement(header);
  hideElement(quizContainer);
  hideElement(submitQuizBtn);
  hideElement(resultsDiv);
  hideElement(loadingMessage);
  hideElement(backBtn);

  // Reset UI elements
  quizContainer.innerHTML = "";
  resultsDiv.innerHTML = "";
  progressBar.style.width = "0%";
  progressBarContainer.setAttribute("aria-valuenow", 0);
  timerElement.textContent = `Time: ${Math.floor(QUIZ_DURATION_SECONDS / 60).toString().padStart(2, '0')}:${(QUIZ_DURATION_SECONDS % 60).toString().padStart(2, '0')}`;

  // Reset all state variables
  resetAllState();
  setTimeLeft(QUIZ_DURATION_SECONDS); // Reset timeLeft to initial duration

  // Show the start menu
  showElement(startMenu, 'flex');

  // Reset select options and button state
  quizCategorySelect.value = "";
  hideElement(dailyOptionsContainer);
  hideElement(unitOptionsContainer);
  dailyWeekSelect.value = "";
  dailyDaySelect.innerHTML = '<option value="">Select Day</option>';
  dailyDaySelect.disabled = true;
  unitSelect.value = "";
  startQuizBtn.disabled = true;
}
