// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  set,
  ref,
  update,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_X80vOAxGzedQT0Qx17sTZLrYnyxq1cY",
  authDomain: "live-task-assessment.firebaseapp.com",
  databaseURL: "https://live-task-assessment-default-rtdb.firebaseio.com",
  projectId: "live-task-assessment",
  storageBucket: "live-task-assessment.appspot.com",
  messagingSenderId: "445826224445",
  appId: "1:445826224445:web:00071338f875196e06b554",
  measurementId: "G-FZ979LH8JF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
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

      set(ref(database, "users/" + user.uid), {
        FullName: fullName,
        Email: email_input_signUp,
      });
      // alert("user created!");
      loginpress();
      signUp_form.reset();
      // ...
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
      update(ref(database, "users/" + user.uid), {
        Last_login: email_input_logIn,
      });
      // alert("user loged in !");
      window.location.href = "./home.html";
      logIn_form.reset();
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      alert(errorMessage);
    });
});

userForms = document.getElementById("user_options-forms");

function loginpress() {
  userForms.classList.remove("bounceLeft");
  userForms.classList.add("bounceRight");
}
