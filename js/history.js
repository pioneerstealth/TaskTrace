import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyAGVP2-tmrfh9VziN4EfSTSEOr9DIj1r8k",
  authDomain: "task-trace.firebaseapp.com",
  projectId: "task-trace",
  storageBucket: "task-trace.appspot.com",
  messagingSenderId: "542109212256",
  appId: "1:542109212256:web:a54bd96c131eff4a152d05",
  measurementId: "G-MZNCSCVN54"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null; // Variable to hold the current user object

document.addEventListener('DOMContentLoaded', () => {
  const batchList = document.getElementById('batchList');
  const taskList = document.getElementById('taskList');
  const taskModal = document.getElementById('taskModal');
  const closeModalButton = document.getElementById('closeModal');

  closeModalButton.addEventListener('click', () => {
    taskModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === taskModal) {
      taskModal.style.display = 'none';
    }
  });

  // Monitor authentication state changes
  let user1; // Declare user1 in an outer scope

  function handleUserStateChange(callback) {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        // Retrieve user document from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          user1 = currentUser.uid; // Assign value to user1
          callback(user1); // Call the callback function with user1
        } else {
          console.log("User is not an admin");
          window.location.href = 'login_signup.html';
        }
      } else {
        console.log("User is not logged in");
        window.location.href = 'login_signup.html';
      }
    });
  }

  // Use the function
  handleUserStateChange((user1) => {
    console.log(user1); // Now user1 is logged after it has been assigned
    fetchBatches(user1); // Call fetchBatches after user1 is assigned
  });

  async function fetchBatches() {
    try {
      const querySnapshot = await getDocs(collection(db, 'batches'));
      batchList.innerHTML = ''; // Clear previous batch list
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const batchData = doc.data();
          const batchName = batchData.batchName;
          const createdBy = batchData.createdBy;
  
          console.log(createdBy);
  
          if (user1 === createdBy) {
            const listItem = document.createElement('li');
            listItem.textContent = batchName;
            const viewButton = document.createElement('button');
            viewButton.textContent = 'View Tasks';
            viewButton.addEventListener('click', () => displayTasks(doc.id)); // Pass the batchId
            listItem.appendChild(viewButton);
            batchList.appendChild(listItem);
          }
        });
      } else {
        batchList.innerHTML = '<li>No batches</li>';
        console.log("No data available in batches");
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
      batchList.innerHTML = '<li>No batches</li>';
    }
  }

  async function displayTasks(batchId) {
    console.log(`Fetching tasks for batch: ${batchId}`);
    taskList.innerHTML = '';
    try {
      const querySnapshot = await getDocs(collection(db, 'tasks'));
      let foundTasks = false;
      querySnapshot.forEach((doc) => {
        const taskData = doc.data();
        if (taskData.batchId === batchId) {
          foundTasks = true;
          const taskName = taskData.name; // Get the task name
          const listItem = document.createElement('li');
          listItem.textContent = taskName;
          const viewButton = document.createElement('button');
          viewButton.textContent = 'Download Task Data';
          viewButton.addEventListener('click', () => downloadTaskData(taskData.students, batchId));
          listItem.appendChild(viewButton);
          taskList.appendChild(listItem);
        }
      });
  
      if (!foundTasks) {
        taskList.innerHTML = '<li>No tasks</li>';
        console.log(`No data available for tasks in batch: ${batchId}`);
      }
      taskModal.style.display = 'block';
  
    } catch (error) {
      console.error(`Error fetching tasks for batch ${batchId}:`, error);
      taskList.innerHTML = '<li>No tasks</li>';
      taskModal.style.display = 'block';
    }
  }
  
  function downloadTaskData(students, batchId) {
    console.log(`Downloading task data for batch: ${batchId}`);
    const formattedData = students.map((student) => {
      const { id, name,  marks, submissionStatus, taskStatus, timeTaken } = student;
      return { id, name,  marks, submissionStatus, taskStatus, timeTaken };
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(wb, ws, "Task Data");
    XLSX.writeFile(wb, `${batchId}_taskData.xlsx`);
  }
  

});

