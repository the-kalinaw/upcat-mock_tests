// src/api.js
// Handles all interactions with the Google Sheets API.

import { SPREADSHEET_ID, API_KEY } from './config.js';
import { customAlert } from './utils.js'; // Import custom alert for error messages

/**
 * Fetches data from a specified Google Sheet.
 * @param {string} sheetName - The name of the sheet to fetch data from.
 * @returns {Promise<Array<Array<string>>|null>} A promise that resolves to the sheet data (rows and columns)
 * or null if an error occurs.
 */
export async function fetchQuizData(sheetName) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}?key=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to load quiz data: ${res.status} ${res.statusText} - ${errorText}`);
    }

    const data = await res.json();

    if (!data.values || data.values.length === 0) {
      throw new Error("No data found in the selected sheet. Please check the sheet name or data.");
    }
    return data.values;
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    customAlert(`Error loading quiz: ${error.message}. Please try again later.`);
    return null;
  }
}
