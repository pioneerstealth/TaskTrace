// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
  getFirestore,
  doc,
  getDocs,
  getDoc,
  collection,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase configuration
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
const analytics = getAnalytics(app);
const database = getFirestore(app);
const auth = getAuth();

// Redirect to login if user is not logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login_signup.html";
  }
});

// Fetch user data and update UI
function fetchUserData() {
  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(database, "users", user.uid);
    getDoc(userDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const fullName = userData.fullName;
          const email = userData.email;
          const role = userData.role;
          const imgurl = userData.imgurl;

          // Update UI with fetched data
          const infoDiv = document.getElementById("info");
          infoDiv.innerHTML = `
            <img id="profile-pic" src="${imgurl}" alt="Profile Picture">
            <p id="fullname">Name: ${fullName}</p>
            <p id="email">${email}</p>
            <p id="role">Role: ${role}</p>
            <a href="#" id="signout" class="signout">Sign Out</a>
          `;
          const signoutButton = document.getElementById("signout");

          // Add an event listener to the signout button
          signoutButton.addEventListener("click", () => {
            signOut(auth)
              .then(() => {
                console.log("User signed out successfully.");
                window.location.href = "./login_signup.html";
              })
              .catch((error) => {
                console.error("Error signing out:", error);
              });
          });
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.error("Error getting user document:", error);
      });
  } else {
    console.log("User not signed in.");
  }
}


// Call fetchUserData when the page loads if user is already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchUserData();
  }
});

// Prevent page refresh on user icon click
document.getElementById("user").addEventListener("click", (event) => {
  event.preventDefault();
  fetchUserData();
});

const userinfo = document.getElementById('user');
const info = document.getElementById('info');

userinfo.addEventListener('click', function(event) {
    event.preventDefault();
    info.style.opacity = '1';
    info.style.visibility = 'visible'; // Ensure it's visible
});

// Hide info when clicking outside of it
document.addEventListener('click', function(event) {
  const isClickInsideInfo = info.contains(event.target);
  const isClickOnUser = userinfo.contains(event.target);

  if (!isClickInsideInfo && !isClickOnUser) {
      info.style.opacity = '0';
      info.style.visibility = 'hidden'; // Optional: hide it completely
  }
});

// Function to fetch and display the active task
async function fetchActiveTask() {
  const tasksCollectionRef = collection(database, "tasks");
  const tasksQuery = query(tasksCollectionRef, orderBy("createdAt", "desc"), limit(1));
  
  const snapshot = await getDocs(tasksQuery);

  if (!snapshot.empty) {
    const now = new Date();
    let activeTaskHtml = '';
    let timeLeftMs = 0;

    snapshot.forEach((doc) => {
      const taskData = doc.data();
      const taskName = taskData.name;
      const taskDescription = taskData.description;
      const createdAt = taskData.createdAt.toDate();
      const timeLimit = taskData.totaltime; 
      console.log(timeLimit)// Assume format is "HH:MM:SS"

      // Convert time limit to milliseconds
      const [hours, minutes, seconds] = timeLimit.split(':').map(Number);
      const timeLimitMs = (hours * 3600 + minutes * 60 + seconds) * 1000;

      const taskExpiration = new Date(createdAt.getTime() + timeLimitMs);

      if (now <= taskExpiration) {
        console.log(`Active task found: ${taskName}`); // Debugging
        activeTaskHtml += `
          <div>
            <p id="taskname">Name: ${taskName}</p>
            <p id="taskdescription">Description: ${taskDescription}</p>
          </div>
        `;
        timeLeftMs = taskExpiration - now; // Calculate remaining time
      } else {
        console.log(`Task ${taskName} is not active anymore.`); // Debugging
      }
    });

    const taskTitleDiv = document.querySelector('.task-title');
    if (taskTitleDiv) {
      taskTitleDiv.innerHTML = activeTaskHtml || "<p>No active tasks found</p>";
    } else {
      console.error("taskTitleDiv not found in the DOM.");
    }

    // Start the timer based on the remaining time of the active task
    startTimer(timeLeftMs / 1000); // Convert milliseconds to seconds
  } else {
    console.log("No tasks found.");
    const taskTitleDiv = document.querySelector('.task-title');
    if (taskTitleDiv) {
      taskTitleDiv.innerHTML = "<p>No tasks found</p>";
    }
    startTimer(0); // Set the timer to 0 when no tasks are found
  }
}

// Timer code
const initElements = (type) => {
  const els = [{}, {}];
  if (!["s", "m", "h"].includes(type)) return els;

  const target = document.querySelector(`.flip-clock-${type}`);
  if (!target) return els;

  ["left", "right"].forEach((side, index) => {
    const el = els[index];
    el.digit = target.querySelector(`.digit-${side}`);
    el.card = el.digit.querySelector(".card");
    el.cardFaces = el.card.querySelectorAll(".card-face");
    [el.cardFaceA, el.cardFaceB] = el.cardFaces;
  });

  return els;
};

const els = {
  h: initElements("h"),
  m: initElements("m"),
  s: initElements("s")
};

const initializeClock = (h, m, s) => {
  const time = {
    h: [Math.floor(h / 10), h % 10],
    m: [Math.floor(m / 10), m % 10],
    s: [Math.floor(s / 10), s % 10]
  };

  Object.entries(time).forEach(([unit, digits]) => {
    digits.forEach((digit, index) => {
      const el = els[unit][index];
      el.digit.dataset.digitBefore = digit;
      el.cardFaceA.textContent = digit;
      el.cardFaceB.textContent = digit;
    });
  });
};

const updateDigit = (el, newDigit) => {
  if (!el.digit) return;

  const currentDigit = parseInt(el.digit.dataset.digitBefore);
  
  if (currentDigit !== newDigit) {
    el.cardFaceB.textContent = newDigit;

    el.card.addEventListener("transitionend", () => {
      el.digit.dataset.digitBefore = newDigit;
      el.cardFaceA.textContent = newDigit;

      const cardClone = el.card.cloneNode(true);
      cardClone.classList.remove("flipped");
      el.digit.replaceChild(cardClone, el.card);
      el.card = cardClone;
      [el.cardFaceA, el.cardFaceB] = el.card.querySelectorAll(".card-face");
    }, { once: true });

    el.card.classList.add("flipped");
  }
};

const updateClock = (h, m, s) => {
  const time = {
    h: [Math.floor(h / 10), h % 10],
    m: [Math.floor(m / 10), m % 10],
    s: [Math.floor(s / 10), s % 10]
  };

  Object.entries(time).forEach(([unit, digits]) => {
    digits.forEach((digit, index) => updateDigit(els[unit][index], digit));
  });
};

const startTimer = (seconds) => {
  let endTime = Date.now() + seconds * 1000;

  const updateTimer = () => {
    const now = Date.now();
    const timeLeft = Math.max(0, endTime - now);

    if (timeLeft === 0) {
      console.log("Timer finished.");
      updateClock(0, 0, 0); // Set the clock to 0:0:0
    } else {
      const hours = Math.floor(timeLeft / (1000 * 60 * 60) % 24);
      const minutes = Math.floor(timeLeft / (1000 * 60) % 60);
      const seconds = Math.floor(timeLeft / 1000 % 60);

      updateClock(hours, minutes, seconds);

      // Add red animation if time left is below 100 seconds
      const flipClockContainer = document.querySelector('.flip-clock-container');
      if (timeLeft <= 60000) {
        flipClockContainer.classList.add('red');
      } else {
        flipClockContainer.classList.remove('red');
      }

      requestAnimationFrame(updateTimer);
    }
  };

  updateTimer();
};

// Fetch and display active task when the page loads
window.onload = () => {
  fetchActiveTask();
};

// Redirect to feedback page
document.getElementById('submit').onclick = function() {
  window.location.href = 'feedback.html';
};
