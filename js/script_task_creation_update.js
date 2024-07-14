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
import {
  initElements,
  initializeClock,
  updateDigit,
  updateClock,
} from "./timer_task_creation.js";
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
// DOM elements
const elements = {
  leftPanel: document.querySelector(".left-panel"),
  rightPanel: document.querySelector(".right-panel"),
  tableContainer: document.querySelector(".table-container-list-batchmates"),
  timerSection: document.querySelector(".timer-section"),
  completeTaskBtn: document.getElementById("taskcomplete"),
  imagePopup: document.getElementById("imagePopup"),
  batchSelect: document.getElementById("batchSelect"),
  taskForm: {
    taskName: document.getElementById("taskName"),
    tagName: document.getElementById("tagName"),
    taskDescription: document.getElementById("taskDescription"),
    time: document.getElementById("time"),
    reductionPercentage: document.getElementById("reductionPercentage"),
    timeToReduce: document.getElementById("timeToReduce"),
    maxMarks: document.getElementById("maxMarks")
  },
  tableBody: document.getElementById("tableBody"),
  exportBtn: document.getElementById("exportBtn")
};

// State management
const AppState = {
  currentUser: null,
  currentBatch: null,
  currentTask: null
};

// Auth service
const AuthService = {
  init() {
    onAuthStateChanged(auth, this.handleAuthStateChange);
  },

  async handleAuthStateChange(user) {
    if (user) {
      AppState.currentUser = user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        // Admin user, continue
      } else {
        window.location.href = "login_signup.html";
      }
    } else {
      window.location.href = "login_signup.html";
    }
  }
};

// Firebase service
const FirebaseService = {
  async fetchBatches() {
    const batchRef = collection(db, "batches");
    const querySnapshot = await getDocs(batchRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async fetchStudents(batchId) {
    const batchRef = doc(db, "batches", batchId);
    const batchDoc = await getDoc(batchRef);
    return batchDoc.exists() ? batchDoc.data().members || [] : [];
  },

  async updateStudentMarks(batchId, studentId, newMarks) {
    const batchRef = doc(db, "batches", batchId);
    const batchDoc = await getDoc(batchRef);
    if (batchDoc.exists()) {
      const updatedMembers = batchDoc.data().members.map(student => 
        student.id === studentId ? { ...student, marks: newMarks } : student
      );
      await updateDoc(batchRef, { members: updatedMembers });
    }
  },

  async createTask(taskData) {
    return await addDoc(collection(db, "tasks"), taskData);
  }
};

// Cache service
const CacheService = {
  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getItem(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },

  removeItem(key) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
  }
};

// UI service
const UIService = {
  renderBatches(batches) {
    elements.batchSelect.innerHTML = batches.map(batch => 
      `<option value="${batch.id}">${batch.batchName}</option>`
    ).join('');
  },

  renderStudents(students) {
    elements.tableBody.innerHTML = students.map(this.createStudentRow).join('');
    students.forEach((student, index) => {
      const row = elements.tableBody.children[index];
      this.addRowFunctionality(row, student);
    });
  },

  createStudentRow(student) {
    return `
      <tr>
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td><button class="btn btn-outline-primary status pending">Pending</button></td>
        <td><button class="btn btn-outline-primary tsk-status pending">Pending</button></td>
        <td class="timer">00:00:00</td>
        <td class="marks">${student.marks || "0"}</td>
        <td><span class="edit-icon"><i class="fa-regular fa-pen-to-square"></i></span></td>
        <td><span class="view-icon"><i class="fa-regular fa-eye"></i></span></td>
      </tr>
    `;
  },

  addRowFunctionality(row, student) {
    this.addStatusButtonFunctionality(row);
    this.addEditMarksFunctionality(row);
    this.addViewImageFunctionality(row, student.imageUrl || "https://via.placeholder.com/50");
  },

  addStatusButtonFunctionality(row) {
    const statusButton = row.querySelector(".status");
    const tskStatus = row.querySelector(".tsk-status");
    const time = row.querySelector(".timer");
    const marksContent = row.querySelector(".marks");

    statusButton.addEventListener("click", function() {
      // Status button functionality
    });

    tskStatus.addEventListener("click", function() {
      // Task status button functionality
    });
  },

  addEditMarksFunctionality(row) {
    const editIcon = row.querySelector(".edit-icon");
    editIcon.addEventListener("click", () => this.enableMarksEditing(row));
  },

  enableMarksEditing(row) {
    const marksCell = row.querySelector(".marks");
    const currentMarks = marksCell.textContent;
    marksCell.innerHTML = `<input type="text" value="${currentMarks}" class="edit-marks-input"/>`;
    const input = marksCell.querySelector("input");

    const saveMarks = async () => {
      const newMarks = input.value;
      marksCell.textContent = newMarks;
      await FirebaseService.updateStudentMarks(AppState.currentBatch, row.querySelector("td").textContent, newMarks);
    };

    input.addEventListener("blur", saveMarks);
    input.addEventListener("keydown", event => {
      if (event.key === "Enter") saveMarks();
    });
  },

  addViewImageFunctionality(row, imageUrl) {
    const viewIcon = row.querySelector(".view-icon");
    viewIcon.addEventListener("click", () => this.displayImagePopup(imageUrl));
  },

  displayImagePopup(imageUrl) {
    const popupImage = document.getElementById("popupImage");
    popupImage.src = imageUrl;
    elements.imagePopup.style.display = "block";
  },

  initializeUI() {
    elements.completeTaskBtn.addEventListener("click", this.handleCompleteTask);
    document.querySelector(".close").addEventListener("click", this.closeImagePopup);
    window.addEventListener("click", this.handleWindowClick);
    elements.exportBtn.addEventListener('click', this.exportToExcel);
  },

  handleCompleteTask() {
    CacheService.removeItem(CacheService.getItem("taskName"));
    CacheService.clear();
  },

  closeImagePopup() {
    elements.imagePopup.style.display = "none";
  },

  handleWindowClick(event) {
    if (event.target === elements.imagePopup) {
      elements.imagePopup.style.display = "none";
    }
  },

  exportToExcel() {
    const table = document.querySelector('table');
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
    XLSX.writeFile(wb, `${elements.taskForm.taskName.value}.xlsx`);
  }
};

// Timer service
const TimerService = {
  startTimer() {
    const existingEndTime = CacheService.getItem("timerEndTime");
    if (existingEndTime > 0) {
      const remainingTime = Math.max(0, existingEndTime - Date.now());
      startTimerClock(Math.ceil(remainingTime / 1000));
    } else {
      const timeValue = elements.taskForm.time.value;
      const [hours, minutes, seconds] = timeValue.split(":").map(Number);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      CacheService.setItem("totalSeconds", totalSeconds);
      startTimerClock(totalSeconds);
    }
  },



  formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }
};

// Task service
const TaskService = {
  async createTask(batchId, taskData) {
    try {
      if (!AppState.currentUser) {
        throw new Error("User is not authenticated");
      }

      const userDoc = await getDoc(doc(db, "users", AppState.currentUser.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        throw new Error("User is not authorized to create tasks");
      }

      const newTaskData = {
        ...taskData,
        batchId,
        createdBy: AppState.currentUser.uid,
        createdAt: new Date()
      };

      await FirebaseService.createTask(newTaskData);
      CacheService.setItem("StartTime", Date.now());
      CacheService.setItem(taskData.name, true);

      console.log("Task created successfully:", newTaskData);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }
};

// Main application
const App = {
  async init() {
    AuthService.init();
    UIService.initializeUI();
    await this.loadInitialData();
    this.setupEventListeners();
  },

  async loadInitialData() {
    const batches = await FirebaseService.fetchBatches();
    UIService.renderBatches(batches);
    if (batches.length > 0) {
      await this.loadStudents(batches[0].id);
    }
  },

  async loadStudents(batchId) {
    AppState.currentBatch = batchId;
    const students = await FirebaseService.fetchStudents(batchId);
    UIService.renderStudents(students);
  },

  setupEventListeners() {
    elements.batchSelect.addEventListener("change", (event) => this.loadStudents(event.target.value));
    
    document.querySelector(".create-task-button").addEventListener("click", async () => {
      const taskData = {
        name: elements.taskForm.taskName.value,
        tagName: elements.taskForm.tagName.value,
        description: elements.taskForm.taskDescription.value,
        time: elements.taskForm.time.value,
        maxMarks: elements.taskForm.maxMarks.value,
        reductionPercentage: elements.taskForm.reductionPercentage.value,
        timeToReduce: elements.taskForm.timeToReduce.value
      };

      await TaskService.createTask(AppState.currentBatch, taskData);
      TimerService.startTimer();

      elements.leftPanel.classList.add("cardFlip");
      elements.rightPanel.classList.add("slideOutRight");
      elements.tableContainer.classList.add("fadeIn");
      elements.timerSection.classList.add("scaleUpFromBottom");
    });
  }
};

// Initialize the application
document.addEventListener("DOMContentLoaded", () => App.init());