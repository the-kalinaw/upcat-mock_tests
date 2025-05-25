// src/utils.js
// Contains general utility functions used across different modules.

/**
 * Removes the 'hidden' class from an element, making it visible.
 * @param {HTMLElement} element - The DOM element to show.
 * @param {string} [displayType='block'] - The CSS display type to apply (e.g., 'flex', 'grid').
 */
export function showElement(element, displayType = 'block') {
  if (element) {
    element.classList.remove("hidden");
    // Apply specific display type if provided, otherwise default to block.
    // This is useful for elements like the header that use flexbox.
    element.style.display = displayType;
  }
}

/**
 * Adds the 'hidden' class to an element, making it invisible.
 * @param {HTMLElement} element - The DOM element to hide.
 */
export function hideElement(element) {
  if (element) {
    element.classList.add("hidden");
    element.style.display = ''; // Reset display to allow 'hidden' class to take effect
  }
}

/**
 * Displays a custom alert message to the user.
 * This replaces the native `alert()` to avoid blocking the UI.
 * @param {string} message - The message to display.
 */
export function customAlert(message) {
  // For simplicity, we'll use console.log for now, but in a real app,
  // you'd implement a modal or a toast notification system.
  console.warn("Custom Alert:", message);
  // Example of a simple modal (requires HTML/CSS for the modal itself)
  // let modal = document.getElementById('customAlertModal');
  // let modalMessage = document.getElementById('customAlertMessage');
  // if (modal && modalMessage) {
  //   modalMessage.textContent = message;
  //   showElement(modal, 'flex');
  // } else {
  //   alert(message); // Fallback if custom modal not implemented
  // }
}
