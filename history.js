import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', function() {
  const batchList = document.getElementById('batchList');
  const taskList = document.getElementById('taskList');
  const taskModal = document.getElementById('taskModal');
  const closeModalButton = document.getElementById('closeModal');

  closeModalButton.addEventListener('click', () => {
    taskModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target == taskModal) {
      taskModal.style.display = 'none';
    }
  });

  // fetch and disply
  get(ref(db, 'batches/'))
  .then(snapshot => {
    if (snapshot.exists()) {
      const batches = snapshot.val();
      for (const batchId in batches) {
        const listItem = document.createElement('li');
        listItem.textContent = batchId;
        const viewButton = document.createElement('button');
        viewButton.textContent = 'View Tasks';
        viewButton.addEventListener('click', () => displayTasks(batchId));
        listItem.appendChild(viewButton);
        batchList.appendChild(listItem);
      }
    } else {
      console.log("No data available in batches");
    }
  }).catch(error => {
    console.error("Error fetching batches:", error);
  });

  function displayTasks(batchId) {
    console.log(`Fetching tasks for batch: ${batchId}`); 
    taskList.innerHTML = ''; 
    get(ref(db, `tasks/${batchId}`))
    .then(snapshot => {
      if (snapshot.exists()) {
        const tasks = snapshot.val();
        for (const taskId in tasks) {
          const listItem = document.createElement('li');
          listItem.textContent = taskId;
          const downloadButton = document.createElement('button');
          downloadButton.textContent = 'Download';
          downloadButton.addEventListener('click', () => downloadTaskData(tasks[taskId], taskId));
          listItem.appendChild(downloadButton);
          taskList.appendChild(listItem);
        }
        taskModal.style.display = 'block';
      } else {
        console.log(`No data available for tasks in batch: ${batchId}`);
      }
    }).catch(error => {
      console.error(`Error fetching tasks for batch ${batchId}:`, error);
    });
  }

  function downloadTaskData(taskData, taskId) {
    console.log(`Downloading task data for task: ${taskId}`); 
    const formattedData = [];
    for (const [key, value] of Object.entries(taskData)) {
      if (typeof value === 'object' && value !== null) {
        formattedData.push({ id: key, ...value });
      } else {
        formattedData.push({ id: key, value });
      }
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(wb, ws, "Task Data");
    XLSX.writeFile(wb, `${taskId}.xlsx`);
  }
});
