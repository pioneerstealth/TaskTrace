import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set, push, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase configuration (same as app.js)
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

document.addEventListener("DOMContentLoaded", function() {
    const tableContainer = document.getElementById('tableContainer');
    const batchNameHeading = document.getElementById('batchName');
    const addMemberButton = document.getElementById('addMemberButton');
    let isFirstAddition = true; // Flag to track first addition

    // Function to fetch and display batch details as a table
    function fetchBatchDetails(batchName) {
        const batchRef = ref(db, `batches/${batchName}`);
        onValue(batchRef, (snapshot) => {
            const batchData = snapshot.val();

            if (batchData) {
                batchNameHeading.textContent = `Batch Name: ${batchName}`;

                let tableHtml = '';
                Object.keys(batchData).forEach(memberId => {
                    const member = batchData[memberId];
                    tableHtml += `<tr id="${memberId}">
                        <td>${member.id}</td>
                        <td contenteditable="true">${member.name}</td>
                        <td><button onclick="updateMember('${batchName}', '${memberId}')">Update</button></td>
                        <td><button onclick="removeMember('${batchName}', '${memberId}')">Remove</button></td>
                    </tr>`;
                });

                tableContainer.innerHTML = `<table id="batchTable" border="1">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th colspan="2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableHtml}
                    </tbody>
                </table>`;
            } else {
                tableContainer.innerHTML = `No members found for batch: ${batchName}`;
            }
        }, (error) => {
            console.error("Error fetching batch details:", error);
            tableContainer.innerHTML = `Error fetching batch details: ${error.message}`;
        });
    }

    // Function to add new member to batch
    addMemberButton.addEventListener('click', function() {
        generateId(batchName).then(newId => {
            const nextId = parseInt(newId) + 1; // Increment newId by 1 for display
            const newRowHtml = `<tr id="${newId}">
                <td>${nextId}</td>
                <td contenteditable="true"></td>
                <td><button onclick="saveNewMember('${newId}')">Save</button></td>
                <td><button onclick="cancelAdd('${newId}')">Cancel</button></td>
            </tr>`;

            const batchTable = document.getElementById('batchTable').querySelector('tbody');
            batchTable.insertAdjacentHTML('beforeend', newRowHtml);

            if (isFirstAddition) {
                isFirstAddition = false; // Set flag to false after the first addition
            }
        }).catch(error => {
            console.error("Error generating ID:", error);
        });
    });
    // Function to save new member to Firebase
    window.saveNewMember = function(newId) {
        const tableRow = document.getElementById(newId);
        const name = tableRow.querySelector('td:nth-child(2)').textContent;
        const nextId = parseInt(newId) + 1;
        const memberRef = ref(db, `batches/${batchName}/${newId}`);
        set(memberRef, {
            id: nextId,
            name: name
        }).then(() => {
            console.log("New member added successfully.");
            tableRow.innerHTML = `<td>${nextId}</td>
                <td contenteditable="true">${name}</td>
                <td><button onclick="updateMember('${batchName}', '${newId}')">Update</button></td>
                <td><button onclick="removeMember('${batchName}', '${newId}')">Remove</button></td>`;
        }).catch((error) => {
            console.error("Error adding new member:", error);
        });
    };

    // Function to remove member from batch
    window.removeMember = function(batchName, memberId) {
        const memberRef = ref(db, `batches/${batchName}/${memberId}`);
        remove(memberRef).then(() => {
            console.log("Member removed successfully.");
        }).catch((error) => {
            console.error("Error removing member:", error);
        });
    };

    // Function to update member in batch
    window.updateMember = function(batchName, memberId) {
        const tableRow = document.getElementById(memberId);
        const newName = tableRow.querySelector('td:nth-child(2)').textContent;

        const memberRef = ref(db, `batches/${batchName}/${memberId}`);
        set(memberRef, {
            id: memberId,
            name: newName
        }).then(() => {
            console.log("Member updated successfully.");
        }).catch((error) => {
            console.error("Error updating member:", error);
        });
    };

    // Function to cancel adding new member
    window.cancelAdd = function(newId) {
        const tableRow = document.getElementById(newId);
        tableRow.parentNode.removeChild(tableRow);
    };

    // Function to generate new ID based on the last used ID in the database
    function generateId(batchName) {
        return new Promise((resolve, reject) => {
            const batchRef = ref(db, `batches/${batchName}`);
            onValue(batchRef, (snapshot) => {
                const batchData = snapshot.val();
                if (!batchData) {
                    resolve(1); // Start with 1 if no members exist
                    return;
                }

                // Find the highest member ID and generate the next ID
                let maxId = 0;
                Object.keys(batchData).forEach(memberId => {
                    if (parseInt(memberId) > maxId) {
                        maxId = parseInt(memberId);
                    }
                });

                const newId = maxId + 1;
                resolve(newId);
            }, (error) => {
                reject(error);
            });
        });
    }

    // Get batch name from query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const batchName = urlParams.get('name');

    // Call function to fetch and display batch details
    if (batchName) {
        fetchBatchDetails(batchName);
    } else {
        tableContainer.innerHTML = "Batch name not provided.";
    }
});
