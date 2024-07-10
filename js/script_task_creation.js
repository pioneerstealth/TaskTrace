import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
 
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
 
// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let currentUser = null;


  const leftPanel = document.querySelector(".left-panel");
  const rightPanel = document.querySelector(".right-panel");
  const tableContainer = document.querySelector(
    ".table-container-list-batchmates"
  );
  const timerSection = document.querySelector(".timer-section");

 
 
// Check if user is authenticated on page load
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    // Retrieve user document from Firestore
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    if (userDoc.exists() && userDoc.data().role === "admin") {

    } else {
      // Redirect to login/signup page if user is not admin
      window.location.href = "login_signup.html";
    }
  } else {
    // Redirect to login/signup page if no user is authenticated
  }
});
 
document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("imagePopup").style.display = "none";
  await fetchBatches(); // Fetch and display batches on page load
  // Other event listeners and functionality remain unchanged
});


 
const button = document.querySelector(".create-task-button");
button.addEventListener("click", async () => {
  const selectedBatchId = document.getElementById("batchSelect").value;
  const taskName = document.getElementById("taskName").value;
  const taskDescription = document.getElementById("taskDescription").value;
  if (taskName && taskDescription) {
    await createTask(selectedBatchId, taskName, taskDescription);
    console.log(`Task created for batch: ${selectedBatchId}`);
  } else {
    console.log("Task name and description are required.");
  }
});
 
async function fetchBatches() {
  const batchRef = collection(db, "batches");
  const querySnapshot = await getDocs(batchRef);
 
  const batchSelect = document.getElementById("batchSelect");
 
  querySnapshot.forEach((doc) => {
    const batchName = doc.data().batchName;
    const option = document.createElement("option");
    option.value = doc.id; // Assign batch ID as option value
    option.textContent = batchName;
    batchSelect.appendChild(option);
  });
 
  // Add event listener to handle batch selection
  batchSelect.addEventListener("change", async (event) => {
    const selectedBatchId = event.target.value;
    await fetchStudents(selectedBatchId);
  });
 
  // Fetch students for the initially selected batch
  const initialBatchId = batchSelect.value; // Assuming default selected value
  await fetchStudents(initialBatchId);
}
 
async function fetchStudents(batchId) {
  const batchRef = doc(db, "batches", batchId);
  const batchDoc = await getDoc(batchRef);
 
  if (batchDoc.exists()) {
    const students = batchDoc.data().members || [];
    renderStudents(students);
  } else {
    console.log("No batch found with ID:", batchId);
    // Handle error or display message
  }
}
 
function renderStudents(students) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = ""; // Clear previous data
 
  students.forEach((student) => {
    const row = createStudentRow(student);
    tableBody.appendChild(row);
    addStatusButtonFunctionality(row);
    addEditMarksFunctionality(row);
    addViewImageFunctionality(row, student.imageUrl || "https://via.placeholder.com/50");
  });
}
 
function createStudentRow(student) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${student.id}</td>
    <td>${student.name}</td>
    <td><button class="btn btn-outline-primary status pending">Pending</button></td>
    <td><button class="btn btn-outline-primary tsk-status pending">Pending</button></td>
    <td class="timer">00:00:00</td>
    <td class="marks">${student.marks || "-"}</td>
    <td><span class="edit-icon"><i class="fa-regular fa-pen-to-square"></i></span></td>
    <td><span class="view-icon"><i class="fa-regular fa-eye"></i></span></td>
  `;
  return row;
}
 
function addStatusButtonFunctionality(row) {
  const statusButton = row.querySelector(".status");
  const tskstatus = row.querySelector(".tsk-status");
  statusButton.addEventListener("click", function () {
    if (this.classList.contains("pending")) {
      this.classList.remove("pending");
      this.classList.add("completed");
      this.textContent = "Completed";
    } else {
      this.classList.remove("completed");
      this.classList.add("pending");
      this.textContent = "Pending";
    }
  });
  tskstatus.addEventListener("click", function () {
    if (this.classList.contains("pending")) {
      this.classList.remove("pending");
      this.classList.add("completed");
      this.textContent = "Completed";
    } else {
      this.classList.remove("completed");
      this.classList.add("pending");
      this.textContent = "Pending";
    }
  });
}
 
function addEditMarksFunctionality(row) {
  const editIcon = row.querySelector(".edit-icon");
  editIcon.addEventListener("click", function () {
    enableMarksEditing(row);
  });
}
 
function enableMarksEditing(row) {
  const marksCell = row.querySelector(".marks");
  const currentMarks = marksCell.textContent;
  marksCell.innerHTML = `<input type="text" value="${currentMarks}" class="edit-marks-input"/>`;
  const input = marksCell.querySelector("input");
 
  // Save new marks on blur or enter key press
  input.addEventListener("blur", async function () {
    const newMarks = input.value;
    marksCell.textContent = newMarks;
    await updateStudentMarks(row, newMarks);
  });
  input.addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
      const newMarks = input.value;
      marksCell.textContent = newMarks;
      await updateStudentMarks(row, newMarks);
    }
  });
}
 
async function updateStudentMarks(row, newMarks) {
  const studentId = row.querySelector("td").textContent;
  const batchName = document.getElementById("batchNameDisplay").textContent.replace("Batch Name: ", "");
  const batchRef = collection(db, "batches");
  const q = query(batchRef, where("batchName", "==", batchName));
  const querySnapshot = await getDocs(q);
 
  querySnapshot.forEach(async (doc) => {
    const batchDoc = doc.ref;
    const batchData = doc.data();
    const updatedStudents = batchData.members.map((student) => {
      if (student.id === studentId) {
        return { ...student, marks: newMarks };
      } else {
        return student;
      }
    });
 
    await updateDoc(batchDoc, {
      members: updatedStudents,
    });
  });
}
 
function addViewImageFunctionality(row, imageUrl) {
  const viewIcon = row.querySelector(".view-icon");
  viewIcon.addEventListener("click", function () {
    displayImagePopup(imageUrl);
  });
}
 
function displayImagePopup(imageUrl) {
  const popup = document.getElementById("imagePopup");
  const popupImage = document.getElementById("popupImage");
  popupImage.src = imageUrl;
  popup.style.display = "block";
}
 
document.querySelector(".close").addEventListener("click", function () {
  document.getElementById("imagePopup").style.display = "none";
});
 
window.addEventListener("click", function (event) {
  const popup = document.getElementById("imagePopup");
  if (event.target === popup) {
    popup.style.display = "none";
  }
});
 
// Task creation function
async function createTask(batchId, taskName, taskDescription) {
    try {
  
      if (!currentUser) {
        throw new Error("User is not authenticated");
      }
  
      // Fetch user role
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }
  
      const userData = userDoc.data();
      if (userData.role !== 'admin') {
        throw new Error("User is not authorized to create tasks");
      }
  
      const taskData = {
        name: taskName,
        description: taskDescription,
        batchId: batchId,
        createdBy: currentUser.uid,
        createdAt: new Date()
      };

  
      // Add task document to Firestore
      await addDoc(collection(db, "tasks"), taskData);
      console.log("Task created successfully:", taskData);
        leftPanel.classList.add("cardFlip");
        rightPanel.classList.add("slideOutRight");
        tableContainer.classList.add("fadeIn");
        timerSection.classList.add("scaleUpFromBottom");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }
  const batchSelect = document.getElementById('batchSelect');
  const tagName = document.getElementById('tagName');
  const taskName = document.getElementById('taskName');
  const taskDescription = document.getElementById('taskDescription');
  const time = document.getElementById('time');
  const maxMarks = document.getElementById('maxMarks');
  const reductionPercentage = document.getElementById('reductionPercentage');
  const timeToReduce = document.getElementById('timeToReduce');
  const tableBody = document.getElementById('tableBody');
  const exportBtn = document.getElementById('exportBtn');
  const completeTaskBtn = document.querySelector('.action-btn:nth-child(2)');
  const createTaskBtn = document.querySelector('.create-task-button');
  const extendTimeBtn = document.querySelector('.extend-time-btn');


  
  
  