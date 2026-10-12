
"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.getElementById("saveButton");
    const clearButton = document.getElementById("clearButton");

    const generateReportButton = document.getElementById(
        "generateReportButton"
    );

    const backButton = document.getElementById("backButton");
    const clearAllButton = document.getElementById("clearAllButton");

    const homeworkAssigned = document.getElementById(
        "homeworkAssigned"
    );

    const reportContainer = document.getElementById("reportRecords");

    let reportDisplayed = false;

    // Save a new record or update an existing record.
    if (saveButton) {
        saveButton.addEventListener("click", function (event) {
            event.preventDefault();

            try {
                const saved = saveTeachingSession();

                if (saved === true) {
                    reportDisplayed = false;

                    if (generateReportButton) {
                        generateReportButton.textContent = "Generate Report";
                    }

                    if (reportContainer) {
                        reportContainer.innerHTML = "";
                    }
                }
            } catch (error) {
                console.error("Error saving record:", error);
                alert("Could not save the record: " + error.message);
            }
        });
    }

    // Clear all form fields.
    if (clearButton) {
        clearButton.addEventListener("click", function (event) {
            event.preventDefault();

            try {
                clearChildFields();
            } catch (error) {
                console.error("Error clearing fields:", error);
            }
        });
    }

    // First click displays the report; second click downloads it.
    if (generateReportButton) {
        generateReportButton.addEventListener("click", function (event) {
            event.preventDefault();

            try {
                if (!reportDisplayed) {
                    const sessions = getSavedSessions();

                    if (!Array.isArray(sessions) || sessions.length === 0) {
                        alert(
                            "No teaching records found. Save a teaching record first."
                        );
                        return;
                    }

                    const success = generateTeachingReport();

                    if (
                        success &&
                        reportContainer &&
                        reportContainer.querySelector("table")
                    ) {
                        reportDisplayed = true;
                        generateReportButton.textContent = "Download Report";
                    }
                } else {
                    downloadTeachingReport();
                }
            } catch (error) {
                console.error("Report error:", error);
                alert("Could not process the report: " + error.message);
            }
        });
    }

    // Handle Edit and Delete buttons inside the report.
    if (reportContainer) {
        reportContainer.addEventListener("click", function (event) {
            const button = event.target.closest("button[data-action]");

            if (!button || !reportContainer.contains(button)) {
                return;
            }

            const id = button.dataset.id;
            const action = button.dataset.action;

            // Edit the selected record.
            if (action === "edit") {
                if (typeof startEditingTeachingSession !== "function") {
                    alert("The editing function is missing from sessions.js.");
                    return;
                }

                const success = startEditingTeachingSession(id);

                if (success) {
                    reportDisplayed = false;
                    reportContainer.innerHTML = "";

                    if (generateReportButton) {
                        generateReportButton.textContent = "Generate Report";
                    }
                }
            }

            // Delete the selected record.
            if (action === "delete") {
                if (typeof deleteTeachingSession !== "function") {
                    alert("The delete function is missing from sessions.js.");
                    return;
                }

                const deleted = deleteTeachingSession(id);

                if (deleted) {
                    const success = generateTeachingReport();

                    reportDisplayed = Boolean(success);

                    if (generateReportButton) {
                        generateReportButton.textContent = reportDisplayed
                            ? "Download Report"
                            : "Generate Report";
                    }
                }
            }
        });
    }

    // Close the displayed list of teaching records.
    if (backButton) {
        backButton.addEventListener("click", function (event) {
            event.preventDefault();

            if (reportContainer) {
                reportContainer.innerHTML = "";
            }

            reportDisplayed = false;

            if (generateReportButton) {
                generateReportButton.textContent = "Generate Report";
            }
        });
    }

    // Clear all saved teaching records.
    if (clearAllButton) {
        clearAllButton.addEventListener("click", function () {
            try {
                if (typeof clearAllTeachingRecords !== "function") {
                    alert(
                        "The clear-all function is missing from sessions.js."
                    );
                    return;
                }

                const deleted = clearAllTeachingRecords();

                if (deleted) {
                    reportDisplayed = false;

                    if (reportContainer) {
                        reportContainer.innerHTML = "";
                    }

                    if (generateReportButton) {
                        generateReportButton.textContent = "Generate Report";
                    }
                }
            } catch (error) {
                console.error("Error clearing all records:", error);
                alert("Could not clear all records: " + error.message);
            }
        });
    }

    // Show or hide the Homework Completed field.
    if (homeworkAssigned) {
        homeworkAssigned.addEventListener(
            "change",
            updateHomeworkField
        );
    }

    updateHomeworkField();

    console.log("E-Andulus application initialized.");
});
