// Get the current date string (YYYY-MM-DD) for the Perth time zone.
const perthDateString = new Date().toLocaleDateString('sv-SE', { timeZone: 'Australia/Perth' });

// Create a new date object representing midnight in Perth on the current day.
export const todayForCalculations = new Date(perthDateString);

// This function remains the same.
export const calcDays = (d1, d2) => Math.round((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));