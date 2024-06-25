// Import the functions you need from the SDKs you need
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    const batchSelect = document.getElementById("batchSelect");
    const tableBody = document.querySelector("table tbody");
    const saveStartTimerBtn = document.getElementById('saveStartTimerBtn');
    const mainTimerDisplay = document.getElementById('mainTimer');
    const timeLimitHours = document.getElementById('timeLimitHours');
    const timeLimitMinutes = document.getElementById('timeLimitMinutes');
    const maxMarks = document.getElementById('maxMarks');
    const minMarks = document.getElementById('minMarks');
    const customMarks = document.getElementById('customMarks');
    const exportBtn = document.getElementById('exportBtn');
    const completetask = document.getElementById('completetask');
    const redirect = document.getElementById('Next');
    const taskName = document.getElementById("taskName");
    const customInterval = document.getElementById("customInterval");
    const topicName = document.getElementById("taskName");

    let mainTimer;
    let endTime;
    let taskTimers = [];
    let startTime;

    saveStartTimerBtn.addEventListener('click', startTimer);
    redirect.addEventListener('click', () => window.location.href = "./calculate.html");
    exportBtn.addEventListener('click', exportToExcel);
    completetask.addEventListener('click', markTaskAsDone);
    redirect.addEventListener('click',redirectTohome);

    fetchBatches();


    batchSelect.addEventListener("change", () => {
        fetchStudents(batchSelect.value);
    });

    function fetchBatches() {
        get(ref(db, 'batches/'))
            .then(snapshot => {
                if (snapshot.exists()) {
                    const batches = snapshot.val();
                    for (const batch in batches) {
                        const option = document.createElement("option");
                        option.value = batch;
                        option.textContent = batch;
                        batchSelect.appendChild(option);
                    }
                } else {
                    console.log("No data available");
                }
            }).catch(console.error);
    }

    function fetchStudents(batch) {
        tableBody.innerHTML = ""; // Clear previous data
        get(ref(db, `batches/${batch}`))
            .then(snapshot => {
                if (snapshot.exists()) {
                    const students = snapshot.val();
                    students.forEach(student => {
                        if (student) {
                            const row = document.createElement("tr");
                            row.innerHTML = `
                                <td>${student.id}</td>
                                <td>${student.name}</td>
                                <td><button class="btn btn-outline-primary status-btn">Pending</button></td>
                                <td class="timer">00:00:00</td>
                                <td class="marks">-</td>
                            `;
                            tableBody.appendChild(row);
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

    function startTimer() {
        saveStartTimerBtn.disabled = true;
        const hours = parseInt(timeLimitHours.value) || 0;
        const minutes = parseInt(timeLimitMinutes.value) || 0;
        const totalMilliseconds = (hours * 60 * 60 + minutes * 60) * 1000;
        startTime = Date.now();
        endTime = startTime + totalMilliseconds;
        mainTimer = setInterval(updateMainTimer, 1000);
        document.querySelectorAll('tbody tr').forEach(row => {
            row.querySelector('.marks').textContent = minMarks.value;
            taskTimers.push({ timerCell: row.querySelector('.timer'), startTime });
        });
    }

    function updateMainTimer() {
        const remainingTime = endTime - Date.now();
        if (remainingTime <= 0) {
            clearInterval(mainTimer);
            mainTimerDisplay.textContent = '00:00:00';
        } else {
            mainTimerDisplay.textContent = formatTime(remainingTime);
        }
    }
    function redirectTohome(){
        window.location.href='./home.html';
    }

    function markTaskAsDone() {
        const remainingTime = endTime - Date.now();
        clearInterval(mainTimer);
        mainTimerDisplay.textContent = remainingTime <= 0 ? '00:00:00' : formatTime(remainingTime);

        const minMarksValue = parseInt(minMarks.value) || 0;
        document.querySelectorAll('tbody tr').forEach(row => {
            const status = row.querySelector('.status-btn').textContent.toLowerCase();
            const marksContent = row.querySelector('.marks');
            if (status !== "done") {
                marksContent.textContent = minMarksValue;
                const taskTimer = taskTimers.find(t => t.timerCell.closest('tr') === row);
                taskTimer.timerCell.textContent = "Not Completed";
            }
        });
        pushDataToFirebase();
    }

    function completeTask(event) {
        const currentTime = Date.now();
        const button = event.target;
        const row = button.closest('tr');
        const taskTimer = taskTimers.find(t => t.timerCell.closest('tr') === row);

        if (!taskTimer) return;

        const maxMarksValue = parseInt(maxMarks.value);
        const minMarksValue = parseInt(minMarks.value);
        const timeTaken = currentTime - taskTimer.startTime;
        const deductionPercentage = parseInt(customMarks.value) || 0;
        button.classList.replace('btn-outline-primary', 'btn-success');
        button.textContent = 'Done';
        button.disabled = true;

        taskTimer.timerCell.textContent = formatTime(timeTaken);
        const marksContent = row.querySelector('.marks');
        let marks = maxMarksValue;

        if (currentTime > endTime && deductionPercentage > 0) {
            const minutesLate = Math.floor((currentTime - endTime) / (1000 * 60));
            const customIntervalValue = parseInt(customInterval.value) || 1;
            const deductions = Math.floor((minutesLate + customIntervalValue) / customIntervalValue) * (deductionPercentage * maxMarksValue / 100);
            marks = Math.max(minMarksValue, maxMarksValue - deductions);
        }

        marksContent.textContent = marks;
    }

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    function exportToExcel() {
        const table = document.querySelector('table');
        const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
        XLSX.writeFile(wb, ""+taskName.value+".xlsx");
    }

    function pushDataToFirebase() {
        const batch = batchSelect.value;
        const task = taskName.value;
        const data = Array.from(document.querySelectorAll('tbody tr')).map(row => ({
            id: row.cells[0].textContent,
            name: row.cells[1].textContent,
            status: row.querySelector('.status-btn').textContent,
            marks: row.querySelector('.marks').textContent
        }));

        set(ref(db, `tasks/${batch}/${task}`), data)
            .then(() => console.log("Data pushed to Firebase successfully"))
            .catch(console.error);
    }
});
