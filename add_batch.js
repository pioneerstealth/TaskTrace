import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC_X80vOAxGzedQT0Qx17sTZLrYnyxq1cY",
    authDomain: "live-task-assessment.firebaseapp.com",
    databaseURL: "https://live-task-assessment-default-rtdb.firebaseio.com",
    projectId: "live-task-assessment",
    storageBucket: "live-task-assessment.appspot.com",
    messagingSenderId: "445826224445",
    appId: "1:445826224445:web:00071338f875196e06b554",
    measurementId: "G-FZ979LH8JF"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Counter for ID (optional if IDs are managed by Firebase)
let idCounter = 1;

// Function to initialize the script after DOM content is loaded
document.addEventListener("DOMContentLoaded", function() {
    const addBatchButton = document.getElementById("addMembers");
    const saveButton = document.getElementById("saveButton");
    const batchTableBody = document.getElementById("batchTableBody");
    const batchNameInput = document.getElementById("batchNameInput");
    const notificationDiv = document.getElementById("notification");
    const notificationMessage = document.getElementById("notificationMessage");

    // Event listener for the "Add Members" button
    addBatchButton.addEventListener("click", function() {
        addBatchRow();
    });

    // Event listener for the "Save" button
    saveButton.addEventListener("click", function() {
        saveDataToFirebase();
    });

    // Function to add a new row to the batch table
    function addBatchRow() {
        let newRow = document.createElement("tr");

        let idCell = document.createElement("td");
        idCell.textContent = idCounter++;
        newRow.appendChild(idCell);

        let nameCell = document.createElement("td");
        nameCell.contentEditable = true; // Allow editing of cell content
        newRow.appendChild(nameCell);

        batchTableBody.appendChild(newRow);
    }

    // Function to save batch data to Firebase
    function saveDataToFirebase() {
        let batchData = [];

        // Get the batch name from input field
        const batchName = batchNameInput.value.trim();

        if (batchName === "") {
            console.error("Batch name cannot be empty.");
            return;
        }

        // Loop through table rows and gather data
        batchTableBody.querySelectorAll("tr").forEach(row => {
            let id = row.cells[0].textContent;
            let name = row.cells[1].textContent.trim(); // Trim whitespace from name

            if (name !== "") {
                batchData.push({ id: id, name: name });
            }
        });

        // Save data to Firebase database under the batch name
        const batchRef = ref(db, `batches/${batchName}`);
        set(batchRef, batchData)
            .then(() => {
                console.log(`Batch '${batchName}' data saved successfully.`);
                showNotification(`Batch '${batchName}' data saved successfully.`);
                clearForm(); // Optional: Clear the form after successful save
            })
            .catch((error) => {
                console.error(`Error saving batch '${batchName}' data: `, error);
                showNotification(`Error: ${error.message}`, true); // Show error message
            });
    }

    // Function to show notification
    function showNotification(message, isError = false) {
        notificationMessage.textContent = message;
        notificationDiv.classList.remove("error", "success");
        notificationDiv.classList.add(isError ? "error" : "success", "show");

        setTimeout(() => {
            notificationDiv.classList.remove("show");
        }, 3000); // Hide notification after 3 seconds
    }

    // Optional function to clear the form after saving
    function clearForm() {
        batchNameInput.value = ""; // Clear batch name input
        batchTableBody.innerHTML = ""; // Clear batch table rows
        idCounter = 1; // Reset ID counter
    }
});