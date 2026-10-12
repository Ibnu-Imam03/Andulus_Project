
"use strict";

function saveVolunteerProfile(session) {
    const volunteers = getSavedVolunteers();

    const volunteer = {
        id: session.andulusId,
        name: session.andulusName,
        sex: session.andulusSex
    };

    const existingIndex = volunteers.findIndex(
        item => String(item.id) === String(volunteer.id)
    );

    if (existingIndex !== -1) {
        volunteers[existingIndex] = volunteer;
    } else {
        volunteers.push(volunteer);
    }

    return saveSavedVolunteers(volunteers);
}
