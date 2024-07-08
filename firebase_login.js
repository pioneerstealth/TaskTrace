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

let isSigningUp = false;

const signUp_form = document.getElementById("signUp_form");

signUp_form.addEventListener("submit", (signUp) => {
  signUp.preventDefault();

  const fullName = document.getElementById("fullName").value;
  const email_input_signUp = document.getElementById("email_input_signUp").value;
  const password_input_signUp = document.getElementById("password_input_signUp").value;

  isSigningUp = true;

  createUserWithEmailAndPassword(auth, email_input_signUp, password_input_signUp)
    .then((userCredential) => {
      const user = userCredential.user;
      return setDoc(doc(database, "users", user.uid), {
        email: user.email,
        role: "user",
        fullName: fullName,
      });
    })
    .then(() => {
      isSigningUp = false;
      loginpress();
      signUp_form.reset();
    })
    .catch((error) => {
      isSigningUp = false;
      alert(error.message);
    });
});

const logIn_form = document.getElementById("logIn_form");

logIn_form.addEventListener("submit", (logIn) => {
  logIn.preventDefault();

  const email_input_logIn = document.getElementById("email_input_logIn").value;
  const password_input_logIn = document.getElementById("password_input_logIn").value;

  signInWithEmailAndPassword(auth, email_input_logIn, password_input_logIn)
    .then((userCredential) => {
      const user = userCredential.user;
      const dt = new Date();
      return updateDoc(doc(database, "users", user.uid), {
        lastLogin: dt,
      }).then(() => user); // Pass the user object to the next then block
    })
    .then((user) => {
      const userDocRef = doc(database, "users", user.uid);
      return getDoc(userDocRef);
    })
    .then((docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const role = userData.role;
        if (role === 'admin') {
          window.location.href = "index.html"; // Redirect to index.html if user is an admin
        } else {
          window.location.href = "userhub.html"; // Redirect to userhub.html for non-admin users
        }
      } else {
        console.log("No such document!");
      }
    })
    .catch((error) => {
      alert(error.message);
    });
});

onAuthStateChanged(auth, (user) => {
  if (user && !isSigningUp) {
    console.log("User is signed in but we don't handle redirection here anymore.");
  } else {
    console.log("User is signed out");
  }
});

function loginpress() {
  container.classList.remove("right-panel-active");
}
