// src/timer.js
// Handles the quiz timer logic: starting, stopping, and updating the display.

import { getState, setTimeLeft, setTimerInterval } from './state.js';
import { timerElement } from './domElements.js';
import { QUIZ_DURATION_SECONDS } from './config.js';
import { submitQuiz } from './quizLogic.js'; // Import submitQuiz to auto-submit on time out

/**
 * Starts or restarts the quiz timer.
 */
export function startTimer() {
  const { timerInterval: currentInterval } = getState();
  clearInterval(currentInterval); // Clear any previous timers

  // Initialize timeLeft from config if it's the start of a new quiz,
  // otherwise continue from current timeLeft.
  let initialTime = getState().timeLeft > 0 ? getState().timeLeft : QUIZ_DURATION_SECONDS;
  setTimeLeft(initialTime);

  // Display initial time immediately
  const initialMinutes = Math.floor(initialTime / 60);
  const initialSeconds = initialTime % 60;
  timerElement.textContent = `Time: ${initialMinutes}:${initialSeconds < 10 ? '0' : ''}${initialSeconds}`;

  const interval = setInterval(() => {
    let newTimeLeft = getState().timeLeft - 1;
    setTimeLeft(newTimeLeft); // Update state

    const minutes = Math.floor(newTimeLeft / 60);
    const seconds = newTimeLeft % 60;
    timerElement.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    if (newTimeLeft <= 0) {
      clearInterval(getState().timerInterval); // Stop timer
      submitQuiz(); // Auto-submit when time runs out
    }
  }, 1000); // Update every second

  setTimerInterval(interval); // Store the interval ID in state
}

/**
 * Stops the quiz timer.
 */
export function stopTimer() {
  clearInterval(getState().timerInterval);
  setTimerInterval(undefined); // Clear the stored interval ID
}
