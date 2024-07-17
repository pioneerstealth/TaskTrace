import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
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

document.addEventListener('DOMContentLoaded', () => {
  const taskHistoryList = document.getElementById('taskHistoryList');

  auth.onAuthStateChanged(async function(user) {
    console.log(user);
    if (user) {
      try {
        const userEmail = user.email;
        const fullName = await getUserFullName(userEmail);
        fetchTaskHistory(fullName);
      } catch (error) {
        console.error("Error fetching user full name:", error);
        window.location.href = 'login.html';
      }
    } else {
      // Redirect to login if not logged in
      window.location.href = 'login.html';
    }
  });

  // Get the full name of the user
  function getUserFullName(email) {
    return new Promise(function(resolve, reject) {
      const userQuery = query(collection(db, 'users'), where('email', '==', email));
      getDocs(userQuery)
        .then(function(querySnapshot) {
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            resolve(userData.fullName);
          } else {
            reject("User not found");
          }
        })
        .catch(function(error) {
          reject(error);
        });
    });
  }

  // Fetch task history for the user
  async function fetchTaskHistory(fullName) {
    try {
      const taskQuerySnapshot = await getDocs(collection(db, 'tasks'));
      //taskHistoryList.innerHTML = ''; // Clear previous task history
      let foundTasks = false;

      taskQuerySnapshot.forEach((doc) => {
        const taskData = doc.data();
        const students = taskData.students || [];

        students.forEach((student) => {
          if (student.name === fullName) {
            foundTasks = true;
            const listItem = document.createElement('li');
            listItem.innerHTML = `
              <p style="font-weight: bold;">TAG :   ${doc.data().tagName}</p>
              <p>Question : ${doc.data().description}</p>
              <p>Total Time : ${doc.data().time}</p>
              <p>Time Taken : ${student.timeTaken}</p>
               <p>Status : ${student.submissionStatus}</p>
              <p>Marks : ${student.marks}</p>
             
              
             
            `;
            taskHistoryList.appendChild(listItem);
          }
        });
      });

      if (!foundTasks) {
        taskHistoryList.innerHTML = '<li>No task history available</li>';
      }
    } catch (error) {
      console.error("Error fetching task history:", error);
      taskHistoryList.innerHTML = '<li>Error fetching task history</li>';
    }
  }
});


