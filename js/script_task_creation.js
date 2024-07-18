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
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  initElements,
  initializeClock,
  updateDigit,
  updateClock,
} from "./timer_task_creation.js";
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

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let currentUser = null;
let taskId;
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

function getTableData() {
  const table = document.querySelector('table');
  const rows = table.getElementsByTagName("tr");
  const data = [];

  for (let i = 1; i < rows.length; i++) { // Skip the header row
    const cells = rows[i].getElementsByTagName("td");
    const rowData = {
      id: cells[0].textContent,
      name: cells[1].textContent,
      submissionStatus: cells[2].querySelector("button").textContent,
      taskStatus: cells[3].querySelector("button").textContent,
      timeTaken: cells[4].textContent,
      marks: cells[5].textContent,
    };
    data.push(rowData);
  }

  return data;
}

const completeTaskBtn = document.getElementById("taskcomplete");
console.log(completeTaskBtn);
completeTaskBtn.addEventListener("click", async () => {
    console.log("inside completetask");
    
    // Get table data
    const newTableData = getTableData();
    console.log("New Table Data:", newTableData);

    // Get task ID from localStorage
    const taskId = localStorage.getItem("taskId");
    console.log("taskid", taskId);

    // Check if task ID exists
    if (!taskId) {
        throw new Error("Task ID not found in localStorage");
    }

    try {
        // Get a reference to the Firestore document
        const taskDocRef = doc(db, "tasks", taskId);

        // Get the current data from the document
        const taskDoc = await getDoc(taskDocRef);
        if (!taskDoc.exists()) {
            throw new Error("Task document not found in Firestore");
        }

        const currentData = taskDoc.data();
        const currentStudents = currentData.students || [];

        // Merge current data with new data
        const updatedStudents = currentStudents.map(student => {
            const newStudentData = newTableData.find(newData => newData.id === student.id);
            return newStudentData ? { ...student, ...newStudentData } : student;
        });

        // Add any new students that were not in the current list
        newTableData.forEach(newStudentData => {
            if (!currentStudents.some(student => student.id === newStudentData.id)) {
                updatedStudents.push(newStudentData);
            }
        });

        // Update the document with the merged data
        await updateDoc(taskDocRef, {
            students: updatedStudents,
            status: "completed",
          
        });

        let totalTime = 0;
        let studentCount = 0;
        updatedStudents.forEach(student => {
            if (student.timeTaken && student.timeTaken !== "00:00:00") {
                totalTime += parseTimeToMilliseconds(student.timeTaken);
                studentCount++;
            }
        });
        
        const avgTimeInMilliseconds = studentCount > 0 ? totalTime / studentCount : 0;
        
        // Update the document with the merged data and average time
        await updateDoc(taskDocRef, {
            students: updatedStudents,
            status: "completed",
            avgTime: avgTimeInMilliseconds
        });

        // Clear localStorage after successful update
        localStorage.clear();
        console.log("Task updated successfully with table data.");
    } catch (error) {
        console.error("Error updating task document:", error);
    }
});


function parseTimeToMilliseconds(timeString) {
  const timeParts = timeString.split(':').map(Number); // Split the string by ':' and convert each part to a number
  let milliseconds = 0;

  if (timeParts.length === 3) {
    // Format: hh:mm:ss
    milliseconds += timeParts[0] * 60 * 60 * 1000; // Hours to milliseconds
    milliseconds += timeParts[1] * 60 * 1000;      // Minutes to milliseconds
    milliseconds += timeParts[2] * 1000;           // Seconds to milliseconds
  } else if (timeParts.length === 2) {
    // Format: mm:ss
    milliseconds += timeParts[0] * 60 * 1000;      // Minutes to milliseconds
    milliseconds += timeParts[1] * 1000;           // Seconds to milliseconds
  } else if (timeParts.length === 1) {
    // Format: ss
    milliseconds += timeParts[0] * 1000;           // Seconds to milliseconds
  }
  console.log(milliseconds);
  return milliseconds;

}


document.addEventListener("DOMContentLoaded", async () => {
  // console.log((localStorage.getItem('timerEndTime')-Date.now())>0)
  if (localStorage.getItem(localStorage.getItem("taskName"))) {
    leftPanel.classList.add("cardFlip");
    rightPanel.classList.add("slideOutRight");
    tableContainer.classList.add("fadeIn");
    timerSection.classList.add("scaleUpFromBottom");
    const batchData = localStorage.getItem("batch");
    fetchStudents(batchData);
    initializeTimer();
  }
  document.getElementById("imagePopup").style.display = "none";
  await fetchBatches(); // Fetch and display batches on page load
  // Other event listeners and functionality remain 
});

const tagNameInput = document.getElementById("tagName");
const tagNameSuggestions = document.getElementById("tagNameSuggestions");
const suggestions = ["HTML", "JS", "TS", "CPP", "JAVA", "BOOTSTRAP"];

//Formatting the timer section
function formatTimeInput(input) {
  const cleanInput = input.replace(/[^0-9]/g, ""); // Remove non-numeric characters
  let formattedInput = "";

  if (cleanInput.length >= 1) {
    formattedInput = cleanInput.slice(0, 2);
  }
  if (cleanInput.length >= 3) {
    formattedInput += ":" + cleanInput.slice(2, 4);
  }
  if (cleanInput.length >= 5) {
    formattedInput += ":" + cleanInput.slice(4, 6);
  }

  return formattedInput;
}

// Apply formatting to both time fields
const timeInputs = [
  document.getElementById("time"),
  document.getElementById("timeToReduce"),
  document.getElementById("timeToExtend"),
];

timeInputs.forEach((input) => {
  input.addEventListener("input", (e) => {
    e.target.value = formatTimeInput(e.target.value);
  });
});

// Populate the datalist with initial suggestions
suggestions.forEach((suggestion) => {
  const option = document.createElement("option");
  option.value = suggestion;
  tagNameSuggestions.appendChild(option);
});

tagNameInput.addEventListener("input", function () {
  this.value = this.value.toUpperCase();

  // Clear existing options
  tagNameSuggestions.innerHTML = "";

  // Add options dynamically based on input value
  suggestions.forEach((suggestion) => {
    if (suggestion.startsWith(this.value)) {
      const option = document.createElement("option");
      option.value = suggestion;
      tagNameSuggestions.appendChild(option);
    }
  });
});

const button = document.querySelector(".create-task-button");
button.addEventListener("click", async () => {
  leftPanel.classList.add("cardFlip");
  rightPanel.classList.add("slideOutRight");
  tableContainer.classList.add("fadeIn");
  timerSection.classList.add("scaleUpFromBottom");
  const selectedBatchId = document.getElementById("batchSelect").value;
  const taskName = document.getElementById("taskName").value;
  localStorage.setItem("taskName",taskName);
  const tagName = document.getElementById("tagName").value;
  const taskDescription = document.getElementById("taskDescription").value;
  const time = document.getElementById("time").value;
  const reductionPercentage = document.getElementById("reductionPercentage").value;
  localStorage.setItem("reductionPercentage", reductionPercentage);
  console.log(reductionPercentage);
  const timeToReduce = document.getElementById("timeToReduce").value;
  console.log(timeToReduce);
  localStorage.setItem("timeToReduce", timeToReduce);
  const maxMarks = document.getElementById("maxMarks").value;
  localStorage.setItem("maxMarks", maxMarks);
  startTimer();
  if (taskName && taskDescription) {
    await createTask(
      selectedBatchId,
      taskName,
      tagName,
      taskDescription,
      time,
      maxMarks
    );
    console.log(`Task created for batch: ${selectedBatchId}`);
  } else {
    console.log("Task name and description are required.");
  }
});

// Time Recommendation
const timeRecommendation = document.getElementById('timeRecommendation');

// Function to get and display the time recommendation
async function updateTimeRecommendation() {
  const tagName = tagNameInput.value.trim();
  
  if (tagName) {
    timeRecommendation.textContent = 'Calculating recommendation...';
    const recommendation = await getTimeRecommendation(tagName);
    timeRecommendation.textContent = recommendation;
  } else {
    timeRecommendation.textContent = '';
  }
}

// Add event listeners
tagNameInput.addEventListener('blur', updateTimeRecommendation);
tagNameInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    updateTimeRecommendation();
  }
});

// Existing getTimeRecommendation and getAverageTimeForTag functions remain the same
async function getAverageTimeForTag(tagName) {
  const querySnapshot = await getDocs(query(collection(db, 'tasks'), where('tagName', '==', tagName)));
  
  let totalTime = 0;
  let taskCount = 0;

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.avgTime) {
      totalTime += data.avgTime;
      taskCount++;
    }
  });

  return taskCount > 0 ? totalTime / taskCount : null;
}

async function getTimeRecommendation(tagName) {
  const avgTimeInMilliseconds = await getAverageTimeForTag(tagName);
  
  if (avgTimeInMilliseconds === null) {
    return "No data available for this tag. Please set an appropriate time.";
  }

  const avgMinutes = Math.round(avgTimeInMilliseconds / (60 * 1000));
  const recommendedTime = avgMinutes.toFixed(2); // Round up to nearest 5 minutes

  return `Based on previous tasks, the recommended time for this tag is ${recommendedTime} minutes.`;
}




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
    localStorage.setItem("batch", selectedBatchId);
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

function listenForTaskUpdates() {
  const taskId = localStorage.getItem("taskId");

  if (!taskId) {
    console.error("Task ID not found in localStorage");
    return;
  }

  const taskDocRef = doc(db, "tasks", taskId);

  onSnapshot(taskDocRef, (taskDoc) => {
    if (!taskDoc.exists()) {
      console.log("No data found for task ID:", taskId);
      return;
    }

    console.log("Task data found. Rendering students...");
    const taskData = taskDoc.data();
    renderStudents(taskData.students);
  });
}

let currentPage = 1;
const studentsPerPage = 10;
let filteredStudents = [];
let allStudents = [];

function renderStudents(students) {
  allStudents = [...students];
  filteredStudents = [...students];
  renderPaginatedStudents();
  setupPagination();
  setupSearch();
}

function renderPaginatedStudents() {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = ""; // Clear previous data

  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  paginatedStudents.forEach((student) => {
    const row = createStudentRow(student);
    tableBody.appendChild(row);
    addStatusButtonFunctionality(row, student);
    addEditMarksFunctionality(row);
    addViewImageFunctionality(
      row,
      student.imgurl || "https://via.placeholder.com/50"
    );
  });
}

function setupPagination() {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.innerText = i;
    pageButton.classList.add("btn", "btn-outline-primary", "mx-1");
    if (i === currentPage) {
      pageButton.classList.add("active");
    }
    pageButton.addEventListener("click", () => {
      currentPage = i;
      renderPaginatedStudents();
      setupPagination();
    });
    paginationContainer.appendChild(pageButton);
  }
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm === "") {
      // If search term is empty, show all students
      filteredStudents = [...allStudents];
    } else {
      // Filter students based on search term
      filteredStudents = allStudents.filter(student => 
        startsWithSearch(student.name.toLowerCase(), searchTerm) ||
        startsWithSearch(student.id.toLowerCase(), searchTerm)
      );
    }
    currentPage = 1;
    renderPaginatedStudents();
    setupPagination();
  });
}

function startsWithSearch(str, search) {
  if (search.length > str.length) return false;
  
  for (let i = 0; i < search.length; i++) {
    if (str[i] !== search[i]) return false;
  }
  return true;
}

function createStudentRow(student) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${student.id}</td>
    <td>${student.name}</td>
    <td><button class="btn btn-outline-primary status ${student.submissionStatus === 'Completed' ? 'completed' : 'pending'}">${student.submissionStatus || "Pending"}</button></td>
    <td><button class="btn btn-outline-primary tsk-status ${student.taskStatus === 'Completed' ? 'completed' : 'pending'}">${student.taskStatus || "Pending"}</button></td>
    <td class="timer">${student.timeTaken || "00:00:00"}</td>
    <td class="marks">${student.marks || "0"}</td>
    <td><span class="edit-icon"><i class="fa-regular fa-pen-to-square"></i></span></td>
    <td><span class="view-icon"><i class="fa-regular fa-eye"></i></span></td>
  `;
  return row;
}

function addStatusButtonFunctionality(row, student) {

  if (student == null) {
    console.error('student is null');
    return;
}
  const statusButton = row.querySelector(".status");
  const tskStatus = row.querySelector(".tsk-status");
  const time = row.querySelector(".timer");
  const marksContent = row.querySelector(".marks");
  const taskId = localStorage.getItem("taskId");
  const taskDocRef = doc(db, "tasks", taskId);
  
  // Set initial state based on database data
  if (student.submissionStatus === "Completed") {
    statusButton.classList.remove("pending");
    statusButton.classList.add("completed");
    statusButton.disabled = true;
    time.textContent = student.timeTaken;
    if(parseInt(student.marks) == 0 && student.timeTaken == "00:00:00"){

      const currentTime = Date.now();
      const startTime = parseInt(localStorage.getItem("StartTime"));
      const endTime = startTime + parseInt(localStorage.getItem("totalSeconds")) * 1000;
      const reductionPercentage = parseInt(localStorage.getItem("reductionPercentage"));
      const maxMarks = parseInt(localStorage.getItem("maxMarks"));
      
      const customInterval = localStorage.getItem("timeToReduce");
      const [hours, minutes, seconds] = customInterval.split(":").map(part => parseInt(part, 10));
      const customIntervalMillis = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
      
      const timeTaken = formatTime(currentTime - startTime);
      let marks = maxMarks;
      
      if (currentTime > endTime && reductionPercentage > 0) {
        const millisLate = currentTime - endTime;
        const intervalsLate = Math.floor(millisLate / customIntervalMillis);
        const deductions = intervalsLate * (reductionPercentage * maxMarks / 100);
        marks = Math.max(0, maxMarks - deductions);
      }
      
      time.textContent = timeTaken;
      marksContent.textContent = marks;
    }
  }

  if (student.taskStatus === "Completed") {
    tskStatus.classList.remove("pending");
    tskStatus.classList.add("completed");
  }

  statusButton.addEventListener("click", async function () {
    const currentTime = Date.now();
    const endTime = (parseInt(localStorage.getItem("StartTime")) + parseInt(localStorage.getItem("totalSeconds")) * 1000);
    const reductionPercentage = parseInt(localStorage.getItem("reductionPercentage"));
    
    const customInterval = localStorage.getItem("timeToReduce");
    const [hours, minutes, seconds] = customInterval.split(":").map(part => parseInt(part, 10));
    const customIntervalMillis = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
    
    if (this.classList.contains("pending")) {
        this.classList.remove("pending");
        this.classList.add("completed");
        this.textContent = "Completed";
        this.disabled = true;
        const timeTaken = formatTime(Date.now() - parseInt(localStorage.getItem("StartTime")));
        time.textContent = timeTaken;
        let marks = parseInt(localStorage.getItem("maxMarks"));
    
        if (currentTime > endTime && reductionPercentage > 0) {
            const millisLate = currentTime - endTime;
            const intervalsLate = Math.floor(millisLate / customIntervalMillis);
            const deductions = intervalsLate * (reductionPercentage * marks / 100);
            marks = Math.max(0, marks - deductions);
        }
        marksContent.textContent = marks;

        const updatedFields = {
          submissionStatus: "Completed",
          marks: marks.toString(),
          timeTaken: timeTaken
      };
      
      const updatedStudent = await updateStudentData(taskDocRef, student.id, updatedFields);
      Object.assign(student, updatedStudent);
    } 
  });

  tskStatus.addEventListener("click", async function () {
    if (this.classList.contains("pending")) {
      this.classList.remove("pending");
      this.classList.add("completed");
      this.textContent = "Completed";

      const updatedFields = {
        taskStatus: "Completed"
    };

    const updatedStudent = await updateStudentData(taskDocRef, student.id, updatedFields);
    Object.assign(student, updatedStudent);
      // Update database
      
    } else {
      this.classList.remove("completed");
      this.classList.add("pending");
      this.textContent = "Pending";

      // Update database
      const updatedFields = {
        taskStatus: "Pending"
    };

    const updatedStudent = await updateStudentData(taskDocRef, student.id, updatedFields);
    Object.assign(student, updatedStudent);
    }

  });
}

async function updateStudentData(taskDocRef, studentId, updatedFields) {
  try {
    const taskDoc = await getDoc(taskDocRef);
    if (!taskDoc.exists()) {
      throw new Error("Task document not found in Firestore");
    }

    const currentData = taskDoc.data();
    const currentStudents = currentData.students || [];

    // Update the fields for the specific student
    const updatedStudents = currentStudents.map(student => {
      if (student.id === studentId) {
        return { ...student, ...updatedFields };
      }
      return student;
    });

    // Update the document with the new data
    await updateDoc(taskDocRef, {
      students: updatedStudents
    });

    console.log(`Data updated for student ${studentId}`);
    return updatedStudents.find(student => student.id === studentId);
  } catch (error) {
    console.error("Error updating student data:", error);
    throw error;
  }
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
  const taskId = localStorage.getItem("taskId");

  if (!taskId) {
    console.error("Task ID not found in localStorage");
    return;
  }

  const taskDocRef = doc(db, "tasks", taskId);

  try {
    const taskDoc = await getDoc(taskDocRef);
    if (!taskDoc.exists()) {
      throw new Error("Task document not found in Firestore");
    }

    const currentData = taskDoc.data();
    const currentStudents = currentData.students || [];

    // Update the marks for the specific student
    const updatedStudents = currentStudents.map(student => {
      if (student.id === studentId) {
        return { ...student, marks: newMarks };
      }
      return student;
    });

    //Update the document with the new data
    await updateDoc(taskDocRef, {
      students: updatedStudents
    });

    console.log(`Marks updated for student ${studentId}`);
  } catch (error) {
    console.error("Error updating marks:", error);
  }
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
async function createTask(
  batchId,
  taskName,
  tagName,
  taskDescription,
  time,
  maxMarks
) {
  try {
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }

    // Fetch user role
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }
    localStorage.setItem("StartTime",Date.now());
    localStorage.setItem(taskName,true);
    const userData = userDoc.data();
    if (userData.role !== "admin") {
      throw new Error("User is not authorized to create tasks");
    }

    const taskData = {
      status:"active",
      name: taskName,
      tagName: tagName,
      time: time,
      totaltime:time,
      maxMarks: maxMarks,
      description: taskDescription,
      batchId: batchId,
      createdBy: currentUser.uid,
      createdAt: new Date(),
      students:[]
    };

    const taskDocRef = await addDoc(collection(db, "tasks"), taskData);
    taskId = taskDocRef.id;
    console.log("taskId",taskId);
    localStorage.setItem("taskId",taskId);
    console.log(localStorage.getItem("taskId"));

    listenForTaskUpdates();

    console.log("Task created successfully:", taskData);

    // Fetch students from the batch
    const batchDocRef = doc(db, "batches", batchId);
    const batchDoc = await getDoc(batchDocRef);
    if (!batchDoc.exists()) {
      throw new Error("Batch document not found");
    }

    const batchData = batchDoc.data();
    console.log(batchData.members);
    const students = batchData.members.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      submissionStatus: "Pending",
      taskStatus: "Pending",
      timeTaken: "00:00:00",
      marks: student.marks || "0",
      imgurl: student.imgurl || "https://via.placeholder.com/50"
    }));

    // Update the task document with the fetched students
    await updateDoc(taskDocRef, { students: students });

      leftPanel.classList.add("cardFlip");
      rightPanel.classList.add("slideOutRight");
      tableContainer.classList.add("fadeIn");
      timerSection.classList.add("scaleUpFromBottom");
  } catch (error) {
    console.error("Error creating task:", error);
  }
}
let totalSeconds = 0;

function initializeTimer() {
  const endTime = localStorage.getItem("timerEndTime");
  if (endTime && parseInt(endTime) > Date.now()) {
    startTimerClock();
  } else {
    // Clear any stale timer data
    localStorage.removeItem("timerEndTime");
    updateClock(0, 0, 0);
  }
}

function startTimer() {
  const createTaskBtn = document.querySelector(".create-task-button");
  createTaskBtn.disabled = true;

  const existingEndTime = localStorage.getItem("timerEndTime");
  if (existingEndTime && parseInt(existingEndTime) > Date.now()) {
    startTimerClock();
  } else {
    const timevalue = time.value;
    const [hours, minutes, seconds] = timevalue.split(":").map(part => parseInt(part, 10));
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    localStorage.setItem("totalSeconds",totalSeconds);
    const endTime = Date.now() + totalSeconds * 1000;
    localStorage.setItem("timerEndTime", endTime);
    startTimerClock();
  }
}

function startTimerClock() {
  const updateTimer = () => {
    const endTime = localStorage.getItem("timerEndTime");
    if (!endTime) {
      clearInterval(window.timerInterval);
      updateClock(0, 0, 0);
      return;
    }

    const now = Date.now();
    const timeLeft = Math.max(0, endTime - now);

    if (timeLeft === 0) {
      localStorage.removeItem("timerEndTime");
      updateClock(0, 0, 0);
      clearInterval(window.timerInterval);
    } else {
      const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
      const seconds = Math.floor((timeLeft / 1000) % 60);

      updateClock(hours, minutes, seconds);

      const flipClockContainer = document.querySelector(".flip-clock-container");
      if (timeLeft <= 60000) {
        flipClockContainer.classList.add("red");
      } else {
        flipClockContainer.classList.remove("red");
      }
    }
  };

  clearInterval(window.timerInterval);
  window.timerInterval = setInterval(updateTimer, 1000);
  updateTimer(); // Call immediately to avoid delay
}


function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0"
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

const exportBtn = document.getElementById("exportBtn");

exportBtn.addEventListener('click',()=>{
  console.log(`Downloading task data for batch: ${taskName.value}`);
  const formattedData = allStudents.map((student) => {
    const { id, name,  marks, submissionStatus, taskStatus, timeTaken } = student;
    return { id, name,  marks, submissionStatus, taskStatus, timeTaken };
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(formattedData);
  XLSX.utils.book_append_sheet(wb, ws, "Task Data");
  XLSX.writeFile(wb, `${taskName.value}_taskData.xlsx`);
})

const extendTimeBtn = document.querySelector('.extend-time-btn');
const submitTime= document.getElementById('submitTime');
const popup = document.getElementById('popup-extend');
const timeInput = document.getElementById('timeToExtend');
extendTimeBtn.addEventListener('click', () => {
            popup.style.display = 'block';
});

submitTime.addEventListener('click', async () => {
  const time = timeInput.value;
  const [hours, minutes, seconds] = time.split(":").map(part => parseInt(part, 10));
  const customIntervalMillis = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;

  if (customIntervalMillis) {
    let currentEndTime = parseInt(localStorage.getItem("timerEndTime"));
    if (isNaN(currentEndTime) || currentEndTime <= Date.now()) {
      currentEndTime = Date.now();
    }
    const newEndTime = currentEndTime + customIntervalMillis;

    const taskId = localStorage.getItem("taskId");
    const taskDocRef = doc(db, "tasks", taskId);

    // Update the total seconds in localStorage
    const totalSeconds = parseInt(localStorage.getItem("totalSeconds") || "0") + customIntervalMillis / 1000;
    localStorage.setItem("totalSeconds", totalSeconds);

    // Retrieve and update the time extensions array in localStorage
    const timeExtensions = JSON.parse(localStorage.getItem("timeExtensions")) || [];
    timeExtensions.push({ extension: customIntervalMillis, timestamp: Date.now() });
    localStorage.setItem("timeExtensions", JSON.stringify(timeExtensions));

    
    
    // Update the new end time in Firestore
    await updateDoc(taskDocRef, { 
      newEndTime: newEndTime,
      totaltime:formatTime(totalSeconds*1000),
      noOfExtensions:timeExtensions.length // Save the array of extensions to Firestore
    });

    console.log("New End Time: " + formatTime(newEndTime - Date.now()));

    // Update the end time in localStorage
    localStorage.setItem("timerEndTime", newEndTime);

    // Stop the current timer and start a new one
    clearInterval(window.timerInterval);
    startTimerClock(Math.ceil((newEndTime - Date.now()) / 1000));
  }

  // Hide the popup and clear the time input field
  popup.style.display = 'none';
  timeInput.value = '';
});

        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.style.display = 'none';
                timeInput.value = '';
            }
        });