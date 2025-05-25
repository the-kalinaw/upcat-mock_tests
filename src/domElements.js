// src/domElements.js
// Centralized references to all significant DOM elements used in the application.

// Start Menu Elements
export const startMenu = document.getElementById("startMenu");
export const quizCategorySelect = document.getElementById("quizCategorySelect"); // New select for quiz type
export const dailyOptionsContainer = document.getElementById("dailyOptionsContainer"); // Container for daily options
export const dailyWeekSelect = document.getElementById("dailyWeekSelect"); // Select for daily week
export const dailyDaySelect = document.getElementById("dailyDaySelect"); // Select for daily day
export const unitOptionsContainer = document.getElementById("unitOptionsContainer"); // Container for unit options
export const unitSelect = document.getElementById("unitSelect"); // Select for unit type
export const startQuizBtn = document.getElementById("startQuizBtn");

// Global Elements
export const themeToggleBtn = document.getElementById("themeToggleBtn");

// Quiz Interface Elements
export const header = document.querySelector("header");
export const quizContainer = document.getElementById("quiz");
export const timerElement = document.getElementById("timer");
export const progressBarContainer = document.getElementById("progressBarContainer");
export const progressBar = document.getElementById("progressBar");
export const submitQuizBtn = document.getElementById("submitQuizBtn");
export const resultsDiv = document.getElementById("results");
export const loadingMessage = document.getElementById("loadingMessage");
export const backBtn = document.getElementById("backbtn");
