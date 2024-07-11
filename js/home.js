// Ensure the tasktrace element is visible on load and handle animation end

window.addEventListener("load", function () {
  const tasktrace = document.querySelector(".tasktrace");
  tasktrace.style.visibility = "visible";
  tasktrace.addEventListener("animationend", function () {
    tasktrace.classList.add("visible");
  });
});

// Get the user and info elements
const userinfo = document.getElementById("user");
const info = document.getElementById("info");

// Show user info on user icon click
userinfo.addEventListener("click", function (event) {
  event.preventDefault();
  info.style.opacity = "1";
  info.style.visibility = "visible"; // Ensure it's visible
});

// Hide info when clicking outside of it
document.addEventListener("click", function (event) {
  const isClickInsideInfo = info.contains(event.target);
  const isClickOnUser = userinfo.contains(event.target);

  if (!isClickInsideInfo && !isClickOnUser) {
    info.style.opacity = "0";
    info.style.visibility = "hidden"; // Optional: hide it completely
  }
});

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Prevent page refresh on user icon click
document.getElementById("user").addEventListener("click", (event) => {
  event.preventDefault();
  fetchUserData();
});

// Select the signout button

// Function to fetch user data and update UI
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
            <a href="" id="signout" class="signout">Sign Out</a>
          `;
          const signoutButton = document.getElementById("signout");

          // Add an event listener to the signout button
          signoutButton.addEventListener("click", () => {
            signOut(auth)
              .then(() => {
                console.log("User signed out successfully.");
                window.location.href="./login_signup.html";
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
