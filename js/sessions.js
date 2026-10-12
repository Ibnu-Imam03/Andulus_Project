"use strict";

let editingSessionId = null;

// Read a value from an HTML input or select.
function getFieldValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
}

// Create a unique ID for each teaching session.
function createSessionId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}

// Collect and validate one teaching session.
function collectTeachingSession() {
    const session = {
        id: editingSessionId || createSessionId(),

        executiveName: getFieldValue("executiveName"),

        andulusId: getFieldValue("andulusId"),
        andulusName: getFieldValue("andulusName"),
        andulusSex: getFieldValue("andulusSex"),

        startTime: getFieldValue("startTime"),
        endTime: getFieldValue("endTime"),
        shift: getFieldValue("shift"),

        childName: getFieldValue("childName"),
        grade: getFieldValue("grade"),
        subject: getFieldValue("subject"),
        topic: getFieldValue("topic"),

        startingPoint: getFieldValue("startingPoint"),
        stoppingPoint: getFieldValue("stoppingPoint"),

        homeworkAssigned: getFieldValue("homeworkAssigned"),
        homeworkCompleted: getFieldValue("homeworkCompleted"),

        createdAt: new Date().toISOString()
    };

    // Required fields.
    const requiredFields = [
        ["executiveName", "Executive Name"],
        ["andulusName", "Andulus Name"],
        ["andulusId", "Andulus ID"],
        ["andulusSex", "Andulus Sex"],
        ["startTime", "Start Time"],
        ["endTime", "End Time"],
        ["shift", "Shift"],
        ["childName", "Child Name"],
        ["grade", "Grade"],
        ["subject", "Subject"],
        ["topic", "Topic"],
        ["startingPoint", "Starting Point"],
        ["stoppingPoint", "Stopping Point"],
        ["homeworkAssigned", "Homework Assigned"]
    ];

    for (const [field, label] of requiredFields) {
        if (!session[field]) {
            return {
                success: false,
                message: `Please enter or select ${label}.`
            };
        }
    }

    // Ensure the end time is later than the start time.
    if (session.endTime <= session.startTime) {
        return {
            success: false,
            message: "End Time must be later than Start Time."
        };
    }

    // Homework completion is required when homework is assigned.
    if (
        session.homeworkAssigned.toLowerCase() === "yes" &&
        !session.homeworkCompleted
    ) {
        return {
            success: false,
            message: "Please select whether the homework was completed."
        };
    }

    // Set completion to Not applicable when no homework is assigned.
    if (session.homeworkAssigned.toLowerCase() !== "yes") {
        session.homeworkCompleted = "Not applicable";
    }

    return {
        success: true,
        session: session
    };
}

// Save a new teaching session or update an existing one.
function saveTeachingSession() {
    const result = collectTeachingSession();

    if (!result.success) {
        alert(result.message);
        return false;
    }

    const session = result.session;
    const sessions = getSavedSessions();

    if (editingSessionId !== null) {
        const index = sessions.findIndex(
            item => String(item.id) === String(editingSessionId)
        );

        if (index === -1) {
            alert("The record you are editing could not be found.");
            return false;
        }

        // Preserve the original creation date.
        session.createdAt =
            sessions[index].createdAt || session.createdAt;

        sessions[index] = session;
    } else {
        sessions.push(session);
    }

    // Save records to localStorage.
    if (!saveSavedSessions(sessions)) {
        alert(
            "The teaching record could not be saved. " +
            "Check your browser storage."
        );
        return false;
    }

    const wasEditing = editingSessionId !== null;

    // Exit editing mode.
    editingSessionId = null;

    // Update the volunteer profile if the function exists.
    if (typeof saveVolunteerProfile === "function") {
        const profileSaved = saveVolunteerProfile(session);

        if (!profileSaved) {
            alert(
                "The teaching record was saved, but the member profile " +
                "could not be updated."
            );
        } else {
            alert(
                wasEditing
                    ? "Teaching record updated successfully!"
                    : "Teaching record saved successfully!"
            );
        }
    } else {
        alert(
            wasEditing
                ? "Teaching record updated successfully!"
                : "Teaching record saved successfully!"
        );
    }

    updateSaveButtonText();

    return true;
}

// Load a selected teaching record into the form for editing.
function startEditingTeachingSession(id) {
    const sessions = getSavedSessions();

    const session = sessions.find(
        item => String(item.id) === String(id)
    );

    if (!session) {
        alert("Teaching record not found.");
        return false;
    }

    const fieldIds = [
        "executiveName",
        "andulusId",
        "andulusName",
        "andulusSex",
        "startTime",
        "endTime",
        "shift",
        "childName",
        "grade",
        "subject",
        "topic",
        "startingPoint",
        "stoppingPoint",
        "homeworkAssigned",
        "homeworkCompleted"
    ];

    fieldIds.forEach(fieldId => {
        const field = document.getElementById(fieldId);

        if (field) {
            field.value = session[fieldId] ?? "";
        }
    });

    editingSessionId = session.id;

    updateHomeworkField();
    updateSaveButtonText();

    // Scroll to the form if recordForm exists.
    const form = document.getElementById("recordForm");

    if (form) {
        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    console.log("Editing teaching record:", session.id);

    return true;
}

// Update the Save button text.
function updateSaveButtonText() {
    const saveButton = document.getElementById("saveButton");

    if (saveButton) {
        saveButton.textContent = editingSessionId !== null
            ? "Save Changes"
            : "Save Record";
    }
}

// Delete one teaching record.
function deleteTeachingSession(id) {
    const sessions = getSavedSessions();

    const exists = sessions.some(
        session => String(session.id) === String(id)
    );

    if (!exists) {
        alert("Teaching record not found.");
        return false;
    }

    if (
        !confirm(
            "Are you sure you want to delete this teaching record?"
        )
    ) {
        return false;
    }

    const updatedSessions = sessions.filter(
        session => String(session.id) !== String(id)
    );

    if (!saveSavedSessions(updatedSessions)) {
        alert("Could not delete the teaching record.");
        return false;
    }

    if (String(editingSessionId) === String(id)) {
        editingSessionId = null;
        clearChildFields();
    }

    updateSaveButtonText();

    alert("Teaching record deleted successfully.");

    return true;
}

// Clear all form fields and cancel editing mode.
function clearChildFields() {
    const fieldIds = [
        "executiveName",
        "andulusName",
        "andulusId",
        "andulusSex",
        "startTime",
        "endTime",
        "shift",
        "childName",
        "grade",
        "subject",
        "topic",
        "startingPoint",
        "stoppingPoint",
        "homeworkAssigned",
        "homeworkCompleted"
    ];

    fieldIds.forEach(id => {
        const field = document.getElementById(id);

        if (field) {
            field.value = "";
        }
    });

    updateHomeworkField();

    // Cancel editing mode.
    editingSessionId = null;

    updateSaveButtonText();
}

// Show or hide the Homework Completed field.
function updateHomeworkField() {
    const assigned = document.getElementById("homeworkAssigned");
    const container = document.getElementById(
        "homeworkCompletedContainer"
    );

    if (!assigned || !container) {
        return;
    }

    const homeworkIsAssigned =
        assigned.value.toLowerCase() === "yes";

    container.hidden = !homeworkIsAssigned;

    if (!homeworkIsAssigned) {
        const completed = document.getElementById("homeworkCompleted");

        if (completed) {
            completed.value = "";
        }
    }
}

// Delete all teaching records.
function clearAllTeachingRecords() {
    const sessions = getSavedSessions();

    if (sessions.length === 0) {
        alert("There are no teaching records to clear.");
        return false;
    }

    const confirmed = confirm(
        "Are you sure you want to delete ALL teaching records? " +
        "This cannot be undone."
    );

    if (!confirmed) {
        return false;
    }

    if (!saveSavedSessions([])) {
        alert("Could not clear teaching records.");
        return false;
    }

    editingSessionId = null;
    updateSaveButtonText();

    alert("All teaching records have been deleted.");

    return true;
}