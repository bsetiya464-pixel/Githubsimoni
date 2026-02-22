// script.js

// Function to display current date and time in UTC
function displayCurrentDateTime() {
    const now = new Date();
    const utcDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
    console.log('Current Date and Time (UTC):', utcDateTime);
}

displayCurrentDateTime();