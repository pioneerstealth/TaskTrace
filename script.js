import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase configuration
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


const exportBtn = document.getElementById('exportBtn');
const tableBody = document.querySelector("table tbody");
exportBtn.addEventListener('click', exportToExcel);
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
document.addEventListener('DOMContentLoaded', () => {
    fetchStudents("ILP Batch 4");
});
function fetchStudents(batch) {
    tableBody.innerHTML = ""; // Clear previous data
    get(ref(db, `batches/${batch}`))
        .then(snapshot => {
            if (snapshot.exists()) {
                const students = snapshot.val();
                students.forEach(student => {
                    if (student) {
                        const row = createStudentRow(student);
                        tableBody.appendChild(row);
                        addStatusButtonFunctionality(row);
                        addEditMarksFunctionality(row);
                        addViewImageFunctionality(row,student.imageUrl || 'https://via.placeholder.com/50');
                    }
                });
                document.querySelectorAll(".status-btn").forEach(button => {
                    button.addEventListener('click', completeTask);
                });
            } else {
                console.log("No data available");
            }
        }).catch(console.error);
}

function createStudentRow(student) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td><button class="btn btn-outline-primary status pending">Pending</button></td>
        <td><button class="btn btn-outline-primary tsk-status pending">Pending</button></td>
        <td class="timer">00:00:00</td>
        <td class="marks">${student.marks || '-'}</td>
        <td><span class="edit-icon"><i class="fa-regular fa-pen-to-square"></i></span></td>
        <td><span class="view-icon"><i class="fa-regular fa-eye"></i></span></td>
    `;
    return row;
}

function addStatusButtonFunctionality(row) {
    const statusButton = row.querySelector('.status');
    const tskstatus = row.querySelector('.tsk-status');
    statusButton.addEventListener('click', function() {
        if (this.classList.contains('pending')) {
            this.classList.remove('pending');
            this.classList.add('completed');
            this.textContent = 'Completed';
        } else {
            this.classList.remove('completed');
            this.classList.add('pending');
            this.textContent = 'Pending';
        }
    });
    tskstatus.addEventListener('click', function() {
        if (this.classList.contains('pending')) {
            this.classList.remove('pending');
            this.classList.add('completed');
            this.textContent = 'Completed';
        } else {
            this.classList.remove('completed');
            this.classList.add('pending');
            this.textContent = 'Pending';
        }
    });
}

function addEditMarksFunctionality(row) {
    const editIcon = row.querySelector('.edit-icon');
    editIcon.addEventListener('click', function() {
        enableMarksEditing(row);
    });
}

function enableMarksEditing(row) {
    const marksCell = row.querySelector('.marks');
    const currentMarks = marksCell.textContent;
    marksCell.innerHTML = `<input type="text" value="${currentMarks}" class="edit-marks-input"/>`;
    const input = marksCell.querySelector('input');

    // Save new marks on blur or enter key press
    input.addEventListener('blur', function() {
        const newMarks = input.value;
        marksCell.textContent = newMarks;
    });
    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const newMarks = input.value;
            marksCell.textContent = newMarks;
        }
    });
}

function exportToExcel() {
    const table = document.querySelector('table');
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
    XLSX.writeFile(wb, ""+taskName.value+".xlsx");
}

function addViewImageFunctionality(row, imageUrl) {
    const viewIcon = row.querySelector('.view-icon');
    viewIcon.addEventListener('click', function() {
        displayImagePopup(imageUrl);
    });
}

function displayImagePopup(imageUrl) {
    const popup = document.getElementById('imagePopup');
    const popupImage = document.getElementById('popupImage');
    popupImage.src = imageUrl;
    popup.style.display = 'block';
}

document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('imagePopup').style.display = 'none';
});

window.addEventListener('click', function(event) {
    const popup = document.getElementById('imagePopup');
    if (event.target === popup) {
        popup.style.display = 'none';
    }
});


// function startTimer() {
//     saveStartTimerBtn.disabled = true;
//     const hours = parseInt(timeLimitHours.value) || 0;
//     const minutes = parseInt(timeLimitMinutes.value) || 0;
//     const totalMilliseconds = (hours * 60 * 60 + minutes * 60) * 1000;
//     startTime = Date.now();
//     endTime = startTime + totalMilliseconds;
//     mainTimer = setInterval(updateMainTimer, 1000);
//     document.querySelectorAll('tbody tr').forEach(row => {
//         row.querySelector('.marks').textContent = minMarks.value;
//         taskTimers.push({ timerCell: row.querySelector('.timer'), startTime });
//     });
// }

// function updateMainTimer() {
//     const remainingTime = endTime - Date.now();
//     if (remainingTime <= 0) {
//         clearInterval(mainTimer);
//         mainTimerDisplay.textContent = '00:00:00';
//     } else {
//         mainTimerDisplay.textContent = formatTime(remainingTime);
//     }
// }
// function redirectTohome(){
//     window.location.href='./home.html';
// }

// function markTaskAsDone() {
//     const remainingTime = endTime - Date.now();
//     clearInterval(mainTimer);
//     mainTimerDisplay.textContent = remainingTime <= 0 ? '00:00:00' : formatTime(remainingTime);

//     const minMarksValue = parseInt(minMarks.value) || 0;
//     document.querySelectorAll('tbody tr').forEach(row => {
//         const status = row.querySelector('.status-btn').textContent.toLowerCase();
//         const marksContent = row.querySelector('.marks');
//         if (status !== "done") {
//             marksContent.textContent = minMarksValue;
//             const taskTimer = taskTimers.find(t => t.timerCell.closest('tr') === row);
//             taskTimer.timerCell.textContent = "Not Completed";
//         }
//     });
//     pushDataToFirebase();
// }

// function completeTask(event) {
//     const currentTime = Date.now();
//     const button = event.target;
//     const row = button.closest('tr');
//     const taskTimer = taskTimers.find(t => t.timerCell.closest('tr') === row);

//     if (!taskTimer) return;

//     const maxMarksValue = parseInt(maxMarks.value);
//     const minMarksValue = parseInt(minMarks.value);
//     const timeTaken = currentTime - taskTimer.startTime;
//     const deductionPercentage = parseInt(customMarks.value) || 0;
//     button.classList.replace('btn-outline-primary', 'btn-success');
//     button.textContent = 'Done';
//     button.disabled = true;

//     taskTimer.timerCell.textContent = formatTime(timeTaken);
//     const marksContent = row.querySelector('.marks');
//     let marks = maxMarksValue;

//     if (currentTime > endTime && deductionPercentage > 0) {
//         const minutesLate = Math.floor((currentTime - endTime) / (1000 * 60));
//         const customIntervalValue = parseInt(customInterval.value) || 1;
//         const deductions = Math.floor((minutesLate + customIntervalValue) / customIntervalValue) * (deductionPercentage * maxMarksValue / 100);
//         marks = Math.max(minMarksValue, maxMarksValue - deductions);
//     }

//     marksContent.textContent = marks;
// }

// function formatTime(ms) {
//     const totalSeconds = Math.floor(ms / 1000);
//     const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
//     const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
//     const seconds = String(totalSeconds % 60).padStart(2, '0');
//     return `${hours}:${minutes}:${seconds}`;
// }

// function exportToExcel() {
//     const table = document.querySelector('table');
//     const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
//     XLSX.writeFile(wb, ""+taskName.value+".xlsx");
// }

// function pushDataToFirebase() {
//     const batch = batchSelect.value;
//     const task = taskName.value;
//     const data = Array.from(document.querySelectorAll('tbody tr')).map(row => ({
//         id: row.cells[0].textContent,
//         name: row.cells[1].textContent,
//         status: row.querySelector('.status-btn').textContent,
//         marks: row.querySelector('.marks').textContent
//     }));

//     set(ref(db, `tasks/${batch}/${task}`), data)
//         .then(() => console.log("Data pushed to Firebase successfully"))
//         .catch(console.error);
// }