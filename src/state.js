// src/state.js
// Manages the global state variables of the quiz application.
// Provides getter and setter functions for controlled access to state.

let correctAnswers = []; // Stores correct answers from the sheet for the current quiz.
let totalQuestions = 0;  // Tracks total questions for progress and scoring.
let timeLeft = 0;        // Remaining time for the quiz.
let timerInterval;       // Stores the interval ID for the timer.
let quizQuestionsBySubject = {}; // Stores questions grouped by subject.
let userAnswers = {};    // Stores user's selected answers for each question.

/**
 * Returns the current state of the application.
 * @returns {object} An object containing all current state variables.
 */
export const getState = () => ({
  correctAnswers,
  totalQuestions,
  timeLeft,
  timerInterval,
  quizQuestionsBySubject,
  userAnswers,
});

/**
 * Sets the correct answers array.
 * @param {Array<string>} answers - An array of correct answer strings.
 */
export const setCorrectAnswers = (answers) => { correctAnswers = answers; };

/**
 * Sets the total number of questions.
 * @param {number} count - The total count of questions.
 */
export const setTotalQuestions = (count) => { totalQuestions = count; };

/**
 * Sets the remaining time for the quiz.
 * @param {number} time - The time left in seconds.
 */
export const setTimeLeft = (time) => { timeLeft = time; };

/**
 * Sets the timer interval ID.
 * @param {number} interval - The ID returned by setInterval().
 */
export const setTimerInterval = (interval) => { timerInterval = interval; };

/**
 * Sets the grouped quiz questions.
 * @param {object} questions - An object where keys are subjects and values are arrays of question objects.
 */
export const setQuizQuestionsBySubject = (questions) => { quizQuestionsBySubject = questions; };

/**
 * Sets the user's answers object.
 * @param {object} answers - An object where keys are question numbers and values are user's selected answers.
 */
export const setUserAnswers = (answers) => { userAnswers = answers; };

/**
 * Updates a specific user answer for a given question number.
 * @param {number} questionNumber - The index of the question (0-based).
 * @param {string} answer - The user's selected answer.
 */
export const updateUserAnswer = (questionNumber, answer) => { userAnswers[questionNumber] = answer; };

/**
 * Resets all state variables to their initial values.
 */
export const resetAllState = () => {
  correctAnswers = [];
  totalQuestions = 0;
  timeLeft = 0;
  clearInterval(timerInterval); // Ensure any active timer is cleared
  timerInterval = undefined;
  quizQuestionsBySubject = {};
  userAnswers = {};
};
