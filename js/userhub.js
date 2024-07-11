// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  collection,
  getDoc // Added import for getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase configuration
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

          // Update UI with fetched data
          const infoDiv = document.getElementById("info");
          infoDiv.innerHTML = `
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

// Timer code (unchanged)
(() => {
  "use strict";

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
    let endTime = localStorage.getItem('timerEndTime');
    
    if (!endTime) {
      endTime = Date.now() + seconds * 1000;
      localStorage.setItem('timerEndTime', endTime);
    }

    const initialTimeLeft = Math.max(0, endTime - Date.now());
    const initialHours = Math.floor(initialTimeLeft / (1000 * 60 * 60) % 24);
    const initialMinutes = Math.floor(initialTimeLeft / (1000 * 60) % 60);
    const initialSeconds = Math.floor(initialTimeLeft / 1000 % 60);

    initializeClock(initialHours, initialMinutes, initialSeconds);

    const updateTimer = () => {
      const now = Date.now();
      const timeLeft = Math.max(0, endTime - now);

      if (timeLeft === 0) {
        localStorage.removeItem('timerEndTime');
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

  // Check if there's an existing timer and start it, or start a new one
  const existingEndTime = localStorage.getItem('timerEndTime');
  if (existingEndTime) {
    const remainingTime = Math.max(0, existingEndTime - Date.now());
    startTimer(Math.ceil(remainingTime / 1000));
  } else {
    startTimer(120); // Start a new timer for 2 minutes (120 seconds)
  }
})();

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


window.onload = () => {
  const taskTitleDiv = document.querySelector('.task-title');
  const taskDescriptionDiv = document.querySelector('.description');

  const tasksCollectionRef = collection(database, "tasks");

  onSnapshot(tasksCollectionRef, (snapshot) => {
    let tasksHtml = ''; // Accumulate HTML content

    snapshot.forEach((doc) => {
      const taskData = doc.data();
      const taskName = taskData.taskName;
      const taskDescription = taskData.taskDescription;

      console.log(taskName); // For debugging purposes

      // Append each task to the accumulated HTML
      tasksHtml += `
        <div>
          <p>Name: ${taskName}</p>
          <p>Description: ${taskDescription}</p>
        </div>
      `;
    });

    // Update the HTML elements once with all accumulated data
    taskTitleDiv.innerHTML = tasksHtml;
    // taskDescriptionDiv.innerHTML = tasksHtml; // Uncomment if both need to display the same content
  });
};
