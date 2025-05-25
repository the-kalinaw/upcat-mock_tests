// src/theme.js
// Manages the application's theme (dark/light) toggling.

import { themeToggleBtn } from './domElements.js';

/**
 * Initializes the theme toggle button text based on the current theme.
 * Should be called on DOMContentLoaded.
 */
export function initializeThemeToggle() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  if (themeToggleBtn) {
    themeToggleBtn.textContent = isDark ? '🌙 Dark Mode' : '🌞 Light Mode';
  }
}

/**
 * Toggles the theme between 'dark' and 'light' and updates the button text.
 */
export function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  if (isDark) {
    html.setAttribute('data-theme', 'light');
    themeToggleBtn.textContent = '🌙 Dark Mode';
  } else {
    html.setAttribute('data-theme', 'dark');
    themeToggleBtn.textContent = '🌞 Light Mode';
  }
}
