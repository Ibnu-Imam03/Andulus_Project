
"use strict";

// Store the generated HTML report until download.
let generatedReportHtml = "";

// Escape HTML to prevent saved values from being interpreted as markup.
function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Generate and display the report without downloading it.
function generateTeachingReport() {
    const reportContainer = document.getElementById("reportRecords");

    if (!reportContainer) {
        alert("Error: reportRecords was not found in index.html.");
        return false;
    }

    try {
        if (typeof getSavedSessions !== "function") {
            throw new Error(
                "getSavedSessions() is missing. Check js/storage.js."
            );
        }

        const savedSessions = getSavedSessions();

        if (!Array.isArray(savedSessions)) {
            throw new Error("Saved teaching records have an invalid format.");
        }

        if (savedSessions.length === 0) {
            reportContainer.innerHTML =
                "<p>No teaching records found. Save a teaching record first.</p>";

            generatedReportHtml = "";
            return false;
        }

        // Sort records by start time.
        // Since there is no teaching date field, records are sorted by creation time.
        const sessions = [...savedSessions].sort((a, b) =>
            String(b.createdAt ?? "").localeCompare(
                String(a.createdAt ?? "")
            )
        );

        const headers = [
            "No.",
            "Start Time",
            "End Time",
            "Shift",
            "Executive",
            "Andulus Member",
            "Member ID",
            "Sex",
            "Child",
            "Grade",
            "Subject",
            "Topic",
            "Starting Point",
            "Stopping Point",
            "Homework Assigned",
            "Homework Completed"
        ];

        // Build the report table.
        let tableHtml = `
            <h3>Teaching Report</h3>
            <p>Total teaching records: ${sessions.length}</p>

            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            ${headers.map(header =>
            `<th>${escapeHtml(header)}</th>`
        ).join("")}
                            <th class="actions-column">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        sessions.forEach((session, index) => {
            const values = [
                index + 1,
                session.startTime,
                session.endTime,
                session.shift,
                session.executiveName,
                session.andulusName,
                session.andulusId,
                session.andulusSex,
                session.childName,
                session.grade,
                session.subject,
                session.topic,
                session.startingPoint,
                session.stoppingPoint,
                session.homeworkAssigned,
                session.homeworkCompleted
            ];

            tableHtml += `
                <tr>
                    ${values.map(value =>
                `<td>${escapeHtml(value)}</td>`
            ).join("")}

                    <td class="actions-column">
                        <button
                            type="button"
                            data-action="edit"
                            data-id="${escapeHtml(session.id)}"
                        >Edit</button>

                        <button
                            type="button"
                            data-action="delete"
                            data-id="${escapeHtml(session.id)}"
                        >Delete</button>
                    </td>
                </tr>
            `;
        });

        tableHtml += `
                    </tbody>
                </table>
            </div>
        `;

        // Display the report on the current page.
        reportContainer.innerHTML = tableHtml;

        // Create a clean downloadable table without the Actions column.
        const downloadContainer = document.createElement("div");
        downloadContainer.innerHTML = tableHtml;

        downloadContainer.querySelectorAll(".actions-column").forEach(
            element => element.remove()
        );

        const downloadTableHtml = downloadContainer.innerHTML;

        // Build a standalone HTML report for downloading.
        generatedReportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Andulus Teaching Report</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 25px;
            color: #1f2937;
            background: #f0f9ff;
        }

        h1, h3 {
            color: #0879bd;
        }

        h1 {
            text-align: center;
        }

        .report-header {
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }

        .table-wrapper {
            width: 100%;
            overflow-x: auto;
            background: #ffffff;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
        }

        th, td {
            padding: 10px;
            border: 1px solid #d1d5db;
            text-align: left;
            white-space: nowrap;
        }

        th {
            color: #ffffff;
            background: #0879bd;
        }

        tbody tr:nth-child(even) {
            background: #eaf6ff;
        }

        .report-footer {
            margin-top: 25px;
            color: #64748b;
            font-size: 12px;
        }

        @media print {
            body {
                margin: 10mm;
                background: #ffffff;
            }

            .table-wrapper {
                overflow: visible;
            }

            table {
                font-size: 8px;
            }

            th, td {
                padding: 5px;
                white-space: normal;
                overflow-wrap: anywhere;
            }

            th {
                background: #e5e7eb !important;
                color: #000000 !important;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>

<body>
    <div class="report-header">
        <h1>E-Andulus</h1>
        <p>Teaching Session Management Report</p>
        <p>Generated: ${escapeHtml(new Date().toLocaleString())}</p>
    </div>

    ${downloadTableHtml}

    <div class="report-footer">
        <p>E-Andulus Teaching Session Management System</p>
        <p>To save as PDF, open this file and press Ctrl + P.</p>
    </div>
</body>
</html>`;

        console.log("Teaching report displayed.");
        console.log("Total records:", sessions.length);

        return true;

    } catch (error) {
        console.error("Report generation failed:", error);

        reportContainer.textContent =
            "Could not generate the report: " + error.message;

        alert("Could not generate the report: " + error.message);

        generatedReportHtml = "";
        return false;
    }
}

// Download the generated HTML report.


/* ========================================
   DOWNLOAD TEACHING REPORT
======================================== */

function downloadTeachingReport() {
    if (!generatedReportHtml) {
        alert("Please generate the report first.");
        return;
    }

    const fileName = "E-Andulus-Teaching-Report.html";
    const isTelegram = Boolean(window.Telegram?.WebApp);

    try {
        const blob = new Blob(
            [generatedReportHtml],
            { type: "text/html;charset=utf-8" }
        );

        const downloadUrl = URL.createObjectURL(blob);

        if (!isTelegram) {
            // Download directly in a normal browser.
            const link = document.createElement("a");

            link.href = downloadUrl;
            link.download = fileName;
            link.style.display = "none";

            document.body.appendChild(link);
            link.click();
            link.remove();

            // Do not revoke immediately; the browser needs time to start.
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);
            return;
        }

        // Telegram fallback:
        // Open the report in a new tab so it can be printed or saved.
        // Open synchronously during the button click to reduce popup blocking.
        const reportWindow = window.open("", "_blank");

        if (reportWindow) {
            reportWindow.document.open();
            reportWindow.document.write(generatedReportHtml);
            reportWindow.document.close();

            // Keep the Blob URL available in case it is needed.
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);

            alert(
                "The report is open. Use Print and choose Save as PDF " +
                "to save a copy."
            );
        } else {
            URL.revokeObjectURL(downloadUrl);

            alert(
                "Telegram blocked opening the report. " +
                "Open E-Andulus in Chrome or another browser, " +
                "then generate and download the report."
            );
        }
    } catch (error) {
        console.error("Report download failed:", error);

        alert(
            "Could not download the report: " +
            (error.message || "Unknown error")
        );
    }
}

/* ========================================
   CONNECT REPORT BUTTONS
======================================== */

document.addEventListener("DOMContentLoaded", function () {
    const generateButton =
        document.getElementById("generateReportButton");

    const downloadButton =
        document.getElementById("downloadReportButton");

    if (generateButton) {
        generateButton.addEventListener(
            "click",
            generateTeachingReport
        );
    }

    if (downloadButton) {
        downloadButton.addEventListener(
            "click",
            downloadTeachingReport
        );
    }
});
