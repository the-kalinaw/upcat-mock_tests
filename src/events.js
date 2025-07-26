// src/events.js
// Centralizes the attachment of all event listeners for the application.

import {
  startQuizBtn, submitQuizBtn, themeToggleBtn, backBtn, // Corrected to backBtn
  quizCategorySelect, dailyOptionsContainer, dailyWeekSelect, dailyDaySelect,
  unitOptionsContainer, unitSelect
} from './domElements.js';
import { loadQuiz, submitQuiz, goBackToStartMenu } from './quizLogic.js';
import { toggleTheme } from './theme.js';
import { customAlert, showElement, hideElement } from './utils.js';

/**
 * Attaches all necessary event listeners to DOM elements.
 */
export function attachEventListeners() {
  // Start Quiz Button
  startQuizBtn.addEventListener("click", () => {
    const selectedCategory = quizCategorySelect.value;
    let sheetName = '';

    if (selectedCategory === 'daily') {
      const week = dailyWeekSelect.value;
      const day = dailyDaySelect.value; // This will be like "Day1", "Day2", "Day6Mock"
      if (!week || !day) {
        customAlert("Please select both a Week and a Day for the Daily Diagnostic Test.");
        return;
      }
      // CORRECTED: Form the sheetName as W1D1, W1D2, W1D6Mock
      // Replace 'Day' with 'D' to match the sheet naming convention (e.g., "Day1" -> "D1", "Day6Mock" -> "D6Mock")
      const dayPart = day.replace('Day', 'D');
      sheetName = `${week}${dayPart}`;
    } else if (selectedCategory === 'unit') {
      const unit = unitSelect.value;
      if (!unit) {
        customAlert("Please select a Unit for the Unit Mock Test.");
        return;
      }
      sheetName = unit; // e.g., "Earth Science"
    } else {
      customAlert("Please select a Quiz Type to start.");
      return;
    }

    loadQuiz(sheetName);
  });

  // Submit Quiz Button
  submitQuizBtn.addEventListener("click", submitQuiz);

  // Back Button
  backBtn.addEventListener("click", goBackToStartMenu);

  // Theme Toggle Button
  themeToggleBtn.addEventListener("click", toggleTheme);

  // Quiz Category Select (Daily vs Unit)
  quizCategorySelect.addEventListener('change', () => {
    const selectedCategory = quizCategorySelect.value;
    hideElement(dailyOptionsContainer);
    hideElement(unitOptionsContainer);
    startQuizBtn.disabled = true; // Disable until a valid selection is made

    // Clear selections to ensure correct state and avoid stale data
    dailyWeekSelect.value = '';
    dailyDaySelect.innerHTML = '<option value="">Select Day</option>'; // Clear days
    dailyDaySelect.disabled = true;
    unitSelect.value = '';

    if (selectedCategory === 'daily') {
      showElement(dailyOptionsContainer, 'block');
    } else if (selectedCategory === 'unit') {
      showElement(unitOptionsContainer, 'block');
      // Re-evaluate start button state based on unit select
      startQuizBtn.disabled = !unitSelect.value;
    }
  });

  // Daily Week Select
  dailyWeekSelect.addEventListener('change', () => {
    const week = dailyWeekSelect.value;
    dailyDaySelect.innerHTML = '<option value="">Select Day</option>'; // Clear previous days
    dailyDaySelect.disabled = true;
    startQuizBtn.disabled = true;

    if (week) {
      // Populate days based on the selected week (Day 1-5 + Day 6 Mock)
      dailyDaySelect.disabled = false;
      for (let i = 1; i <= 5; i++) { // Days 1 through 5
        const option = document.createElement('option');
        option.value = `Day${i}`; // Value is "Day1", "Day2", etc.
        option.textContent = `Day ${i}`;
        dailyDaySelect.appendChild(option);
      }
      // Add Day 6 Mock option
      //const mockOption = document.createElement('option');
      //mockOption.value = `Day6Mock`; // Value is "Day6Mock" to match sheet naming
      //mockOption.textContent = `Day 6 Mock`;
      //dailyDaySelect.appendChild(mockOption);
    }
    // Re-evaluate start button state
    startQuizBtn.disabled = !(dailyWeekSelect.value && dailyDaySelect.value);
  });

  // Daily Day Select
  dailyDaySelect.addEventListener('change', () => {
    // Re-evaluate start button state
    startQuizBtn.disabled = !(dailyWeekSelect.value && dailyDaySelect.value);
  });

  // Unit Select
  unitSelect.addEventListener('change', () => {
    // Re-evaluate start button state
    startQuizBtn.disabled = !unitSelect.value;
  });
}
