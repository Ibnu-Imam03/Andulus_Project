
"use strict";

const VOLUNTEERS_KEY = "andalus_volunteers";
const SESSIONS_KEY = "andalus_sessions";

// Read saved data from localStorage.
function readLocalData(key) {
    try {
        const data = localStorage.getItem(key);

        if (data === null) {
            return [];
        }

        const parsedData = JSON.parse(data);

        return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
        console.error("Error reading saved data:", error);
        return [];
    }
}

// Write data to localStorage.
function writeLocalData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Error saving data:", error);
        return false;
    }
}

// Get all saved teaching sessions.
function getSavedSessions() {
    return readLocalData(SESSIONS_KEY);
}

// Save all teaching sessions.
function saveSavedSessions(sessions) {
    return writeLocalData(SESSIONS_KEY, sessions);
}

// Get all saved Andulus members.
function getSavedVolunteers() {
    return readLocalData(VOLUNTEERS_KEY);
}

// Save all Andulus members.
function saveSavedVolunteers(volunteers) {
    return writeLocalData(VOLUNTEERS_KEY, volunteers);
}
