// // Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   doc,
//   getDoc,
// } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// //import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBtsgwSa0T_b9GMESx1Tjhb1n4hohkJyOU",
//   authDomain: "tasktrace-v2.firebaseapp.com",
//   projectId: "tasktrace-v2",
//   storageBucket: "tasktrace-v2.appspot.com",
//   messagingSenderId: "863318084099",
//   appId: "1:863318084099:web:6a9abab8d8893caaf9dc36",
//   measurementId: "G-59DHK1FJ88",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const auth = getAuth(app);

// document.addEventListener('DOMContentLoaded', function() {
//   const batchList = document.getElementById('batchList');
//   const taskList = document.getElementById('taskList');
//   const taskModal = document.getElementById('taskModal');
//   const closeModalButton = document.getElementById('closeModal');

//   closeModalButton.addEventListener('click', () => {
//     taskModal.style.display = 'none';
//   });

//   window.addEventListener('click', (event) => {
//     if (event.target == taskModal) {
//       taskModal.style.display = 'none';
//     }
//   });

//   // Authenticate and fetch batches from Firestore
//   //import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

//   const auth = getAuth(app);
//   signInWithEmailAndPassword(auth, "emmatheresa@gmail.com", "your_password_here")
//     .then((userCredential) => {
//       const user = userCredential.user;
//       console.log("Signed in as:", user.email);
//       fetchBatches(); // Call your fetchBatches function here
//     })
//     .catch((error) => {
//       console.error("Error signing in:", error);
//     });

//   // Fetch and display batches from Firestore
//   async function fetchBatches() {
//     try {
//       const querySnapshot = await getDocs(collection(db, 'batches'));
//       if (!querySnapshot.empty) {
//         querySnapshot.forEach((doc) => {
//           const batchData = doc.data();
//           const batchId = doc.id;
//           const batchName = batchData.batchName;
//           const listItem = document.createElement('li');
//           listItem.textContent = batchName;
//           const viewButton = document.createElement('button');
//           viewButton.textContent = 'View Tasks';
//           viewButton.addEventListener('click', () => displayTasks(batchId));
//           listItem.appendChild(viewButton);
//           batchList.appendChild(listItem);
//         });
//       } else {
//         batchList.innerHTML = '<li>No batches</li>';
//         console.log("No data available in batches");
//       }
//     } catch (error) {
//       console.error("Error fetching batches:", error);
//       batchList.innerHTML = '<li>No batches</li>';
//     }
//   }

//   fetchBatches();

//   async function displayTasks(batchId) {
//     console.log(`Fetching tasks for batch: ${batchId}`);
//     taskList.innerHTML = '';
//     try {
//       const batchDoc = await getDoc(doc(db, 'tasks', batchId));
//       if (batchDoc.exists()) {
//         const tasks = batchDoc.data();
//         if (Object.keys(tasks).length === 0) {
//           taskList.innerHTML = '<li>No tasks</li>';
//         } else {
//           for (const taskId in tasks) {
//             const listItem = document.createElement('li');
//             listItem.textContent = taskId;
//             const downloadButton = document.createElement('button');
//             downloadButton.textContent = 'Download';
//             downloadButton.addEventListener('click', () => downloadTaskData(tasks[taskId], taskId));
//             listItem.appendChild(downloadButton);
//             taskList.appendChild(listItem);
//           }
//         }
//         taskModal.style.display = 'block';
//       } else {
//         taskList.innerHTML = '<li>No tasks</li>';
//         taskModal.style.display = 'block';
//         console.log(`No data available for tasks in batch: ${batchId}`);
//       }
//     } catch (error) {
//       console.error(`Error fetching tasks for batch ${batchId}:`, error);
//       taskList.innerHTML = '<li>No tasks</li>';
//       taskModal.style.display = 'block';
//     }
//   }

//   function downloadTaskData(taskData, taskId) {
//     console.log(`Downloading task data for task: ${taskId}`);
//     const formattedData = [];
//     for (const [key, value] of Object.entries(taskData)) {
//       if (typeof value === 'object' && value !== null) {
//         const { startTime, endTime, ...rest } = value;
//         const totalTime = (endTime && startTime) ? (endTime - startTime) / 1000 : null; // Assuming timestamps in milliseconds
//         formattedData.push({ id: key, totalTime, ...rest });
//       } else {
//         formattedData.push({ id: key, value });
//       }
//     }
//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.json_to_sheet(formattedData);
//     XLSX.utils.book_append_sheet(wb, ws, "Task Data");
//     XLSX.writeFile(wb, `${taskId}.xlsx`);
//   }
// });





import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtsgwSa0T_b9GMESx1Tjhb1n4hohkJyOU",
  authDomain: "tasktrace-v2.firebaseapp.com",
  projectId: "tasktrace-v2",
  storageBucket: "tasktrace-v2.appspot.com",
  messagingSenderId: "863318084099",
  appId: "1:863318084099:web:6a9abab8d8893caaf9dc36",
  measurementId: "G-59DHK1FJ88",
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
 //`2 let user ="emmatheresa@gmail.com";
  // Monitor authentication state changes
  let user1; // Declare user1 in an outer scope

function handleUserStateChange(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      
      currentUser = user;
      console.log(currentUser);
      // Retrieve user document from Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        user1 = userDoc.id; // Assign value to user1
        callback(user1); // Call the callback function with user1
      } else {
        console.log("User is not an admin");
      }
    } else {
      console.log("User is not logged in");
    }
  });
}

// Use the function
handleUserStateChange((user1) => {
  console.log(user1); // Now user1 is logged after it has been assigned
  fetchBatches(); // Call fetchBatches after user1 is assigned
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
    const batchDoc = await getDoc(doc(db, 'tasks', batchId));
    if (batchDoc.exists()) {
      const tasks = batchDoc.data();
      if (Object.keys(tasks).length === 0) {
        taskList.innerHTML = '<li>No tasks</li>';
      } else {
        for (const taskId in tasks) {
          const listItem = document.createElement('li');
          listItem.textContent = taskId;
          const downloadButton = document.createElement('button');
          downloadButton.textContent = 'Download';
          downloadButton.addEventListener('click', () => downloadTaskData(tasks[taskId], taskId));
          listItem.appendChild(downloadButton);
          taskList.appendChild(listItem);
        }
      }
      taskModal.style.display = 'block';
    } else {
      taskList.innerHTML = '<li>No tasks</li>';
      taskModal.style.display = 'block';
      console.log(`No data available for tasks in batch: ${batchId}`);
    }
  } catch (error) {
    console.error(`Error fetching tasks for batch ${batchId}:`, error);
    taskList.innerHTML = '<li>No tasks</li>';
    taskModal.style.display = 'block';
  }
}

function downloadTaskData(taskData, taskId) {
  console.log(`Downloading task data for task: ${taskId}`);
  const formattedData = [];
  for (const [key, value] of Object.entries(taskData)) {
    if (typeof value === 'object' && value !== null) {
      const { startTime, endTime, ...rest } = value;
      const totalTime = (endTime && startTime) ? (endTime - startTime) / 1000 : null; // Assuming timestamps in milliseconds
      formattedData.push({ id: key, totalTime, ...rest });
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

