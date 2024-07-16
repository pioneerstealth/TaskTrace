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


// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// import { getFirestore, collection, getDocs, doc, getDoc, QuerySnapshot, DocumentData } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, User } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.19.0/package/xlsx.mjs";

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyAGVP2-tmrfh9VziN4EfSTSEOr9DIj1r8k",
//   authDomain: "task-trace.firebaseapp.com",
//   projectId: "task-trace",
//   storageBucket: "task-trace.appspot.com",
//   messagingSenderId: "542109212256",
//   appId: "1:542109212256:web:a54bd96c131eff4a152d05",
//   measurementId: "G-MZNCSCVN54"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const auth = getAuth(app);

// interface UserData {
//   email: string;
//   fullName: string;
//   lastLogin: Date;
//   role: string;
// }

// interface Student {
//   id: string;
//   imgurl: string;
//   marks: string;
//   name: string;
//   submissionStatus: string;
//   taskStatus: string;
//   timeTaken: string;
// }

// interface TaskData {
//   batchId: string;
//   createdAt: string;
//   createdBy: string;
//   description: string;
//   maxMarks: string;
//   name: string;
//   newEndTime: number;
//   status: string;
//   students: Student[];
// }

// document.addEventListener('DOMContentLoaded', () => {
//   const batchList = document.getElementById('batchList') as HTMLUListElement;
//   const taskList = document.getElementById('taskList') as HTMLUListElement;
//   const taskModal = document.getElementById('taskModal') as HTMLElement;
//   const closeModalButton = document.getElementById('closeModal') as HTMLButtonElement;

//   closeModalButton.addEventListener('click', () => {
//     taskModal.style.display = 'none';
//   });

//   window.addEventListener('click', (event) => {
//     if (event.target === taskModal) {
//       taskModal.style.display = 'none';
//     }
//   });

//   let currentUser: User | null = null;

//   function handleUserStateChange(callback: (userId: string) => void): void {
//     onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         currentUser = user;
//         const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
//         if (userDoc.exists() && (userDoc.data() as UserData).role === 'admin') {
//           callback(currentUser.uid);
//         } else {
//           console.log("User is not an admin");
//           window.location.href = 'login_signup.html';
//         }
//       } else {
//         console.log("User is not logged in");
//         window.location.href = 'login_signup.html';
//       }
//     });
//   }

//   handleUserStateChange((userId) => {
//     console.log(userId);
//     fetchBatches(userId);
//   });

//   async function fetchBatches(userId: string): Promise<void> {
//     try {
//       const querySnapshot = await getDocs(collection(db, 'batches'));
//       batchList.innerHTML = '';
//       if (!querySnapshot.empty) {
//         querySnapshot.forEach((doc) => {
//           const batchData = doc.data();
//           const batchName = batchData.batchName;
//           const createdBy = batchData.createdBy;

//           if (userId === createdBy) {
//             const listItem = document.createElement('li');
//             listItem.textContent = batchName;
//             const viewButton = document.createElement('button');
//             viewButton.textContent = 'View Tasks';
//             viewButton.addEventListener('click', () => displayTasks(doc.id));
//             listItem.appendChild(viewButton);
//             batchList.appendChild(listItem);
//           }
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

//   async function displayTasks(batchId: string): Promise<void> {
//     console.log(`Fetching tasks for batch: ${batchId}`);
//     taskList.innerHTML = '';
//     try {
//       const querySnapshot = await getDocs(collection(db, 'tasks'));
//       let foundTasks = false;
//       querySnapshot.forEach((doc) => {
//         const taskData = doc.data() as TaskData;
//         if (taskData.batchId === batchId) {
//           foundTasks = true;
//           const taskName = taskData.name;
//           const listItem = document.createElement('li');
//           listItem.textContent = taskName;
//           const viewButton = document.createElement('button');
//           viewButton.textContent = 'Download Task Data';
//           viewButton.addEventListener('click', () => downloadTaskData(taskData.students, batchId));
//           listItem.appendChild(viewButton);
//           taskList.appendChild(listItem);
//         }
//       });

//       if (!foundTasks) {
//         taskList.innerHTML = '<li>No tasks</li>';
//         console.log(`No data available for tasks in batch: ${batchId}`);
//       }
//       taskModal.style.display = 'block';

//     } catch (error) {
//       console.error(`Error fetching tasks for batch ${batchId}:`, error);
//       taskList.innerHTML = '<li>No tasks</li>';
//       taskModal.style.display = 'block';
//     }
//   }

//   function downloadTaskData(students: Student[], batchId: string): void {
//     console.log(`Downloading task data for batch: ${batchId}`);
//     const formattedData = students.map((student) => {
//       const { id, name, marks, submissionStatus, taskStatus, timeTaken } = student;
//       return { id, name, marks, submissionStatus, taskStatus, timeTaken };
//     });
//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.json_to_sheet(formattedData);
//     XLSX.utils.book_append_sheet(wb, ws, "Task Data");
//     XLSX.writeFile(wb, `${batchId}_taskData.xlsx`);
//   }
// });

// auth.onAuthStateChanged(async (user) => {
//   if (user) {
//     const userEmail = user.email;
//     if (userEmail) {
//       try {
//         const fullName = await getUserFullName(userEmail);
//         fetchTaskHistory(fullName);
//       } catch (error) {
//         console.error("Error fetching user full name:", error);
//         window.location.href = 'login.html';
//       }
//     }
//   } else {
//     window.location.href = 'login.html';
//   }
// });

// async function getUserFullName(email: string): Promise<string> {
//   try {
//     const userQuery = collection(db, 'users');
//     const querySnapshot = await getDocs(userQuery);
//     if (!querySnapshot.empty) {
//       const userDoc = querySnapshot.docs.find(doc => (doc.data() as UserData).email === email);
//       if (userDoc) {
//         const userData = userDoc.data() as UserData;
//         return userData.fullName;
//       } else {
//         throw new Error("User not found");
//       }
//     } else {
//       throw new Error("User not found");
//     }
//   } catch (error) {
//     throw new Error(error);
//   }
// }

// async function fetchTaskHistory(fullName: string): Promise<void> {
//   try {
//     const tasksQuery = collection(db, 'tasks');
//     const querySnapshot = await getDocs(tasksQuery);
//     const taskHistoryList = document.getElementById('taskHistoryList') as HTMLUListElement;
//     taskHistoryList.innerHTML = '';
//     if (!querySnapshot.empty) {
//       querySnapshot.forEach((doc) => {
//         const taskData = doc.data() as TaskData;
//         const student = taskData.students.find(student => student.name === fullName);
//         if (student) {
//           const listItem = document.createElement('li');
//           const img = document.createElement('img');
//           img.src = student.imgurl;
//           img.alt = student.name;
//           listItem.appendChild(img);

//           const studentInfo = document.createElement('div');
//           studentInfo.innerHTML = `
//             <p>Name: ${student.name}</p>
//             <p>Marks: ${student.marks}</p>
//             <p>Submission Status: ${student.submissionStatus}</p>
//             <p>Task Status: ${student.taskStatus}</p>
//             <p>Time Taken: ${student.timeTaken}</p>
//           `;
//           listItem.appendChild(studentInfo);
//           taskHistoryList.appendChild(listItem);
//         }
//       });
//     } else {
//       taskHistoryList.innerHTML = '<li>No task history found</li>';
//     }
//   } catch (error) {
//     console.error("Error fetching task history:", error);
//   }
// }

