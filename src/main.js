// src/main.js
// The main entry point for the UPCAT Review Tests application.
// Initializes theme, attaches event listeners, and sets up initial UI state.

import { attachEventListeners } from './events.js';
import { initializeThemeToggle } from './theme.js';
import { startQuizBtn, quizCategorySelect } from './domElements.js';

// Ensure the DOM is fully loaded before initializing the application.
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the theme toggle button's text based on the current theme.
  initializeThemeToggle();

  // Attach all event listeners to the various interactive elements.
  attachEventListeners();

  // Set the initial disabled state of the 'Start Quiz' button.
  // It should be disabled until a quiz category and specific option (daily/unit) is selected.
  startQuizBtn.disabled = true; // Initially disabled
  quizCategorySelect.value = ""; // Ensure no category is selected initially
});
