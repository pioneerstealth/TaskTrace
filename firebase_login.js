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

const signUp_form = document.getElementById("signUp_form");

signUp_form.addEventListener("submit", (signUp) => {
  signUp.preventDefault();

  var fullName = document.getElementById("fullName").value;
  var email_input_signUp = document.getElementById("email_input_signUp").value;
  var password_input_signUp = document.getElementById(
    "password_input_signUp"
  ).value;

  createUserWithEmailAndPassword(
    auth,
    email_input_signUp,
    password_input_signUp
  )
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;
      // Create a user document in Firestore
      return setDoc(doc(database, "users", user.uid), {
        email: user.email,
        role: "user",
        fullName: fullName,
      });
    })
    .then(() => {
      loginpress();
      signUp_form.reset();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      alert(errorMessage);
      // ..
    });
});

const logIn_form = document.getElementById("logIn_form");

logIn_form.addEventListener("submit", (logIn) => {
  logIn.preventDefault();

  var email_input_logIn = document.getElementById("email_input_logIn").value;
  var password_input_logIn = document.getElementById(
    "password_input_logIn"
  ).value;
  signInWithEmailAndPassword(auth, email_input_logIn, password_input_logIn)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;

      const dt = new Date();
      // Update the user's last login in Firestore
      return updateDoc(doc(database, "users", user.uid), {
        lastLogin: dt,
      });
    })
    .then(() => {
      logIn_form.reset();
      window.location.href="./task_creation.html"
      // Optionally show a message
      // alert("User logged in!");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error during sign-in:", errorCode, errorMessage);
      alert(errorMessage);
    });
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    const userDocRef = doc(database, "users", user.uid);
    getDoc(userDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const role = userData.role;
          console.log(userData, "\n", role);
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.error("Error getting user document:", error);
      });
  } else {
    // User is signed out
    console.log("User is signed out");
  }
});

function loginpress() {
  container.classList.remove("right-panel-active");
}
