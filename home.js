// Ensure the tasktrace element is visible on load and handle animation end

window.addEventListener('load', function() {
    const tasktrace = document.querySelector('.tasktrace');
    tasktrace.style.visibility = 'visible';
    tasktrace.addEventListener('animationend', function() {
        tasktrace.classList.add('visible');
    });
});

// Get the user and info elements
const userinfo = document.getElementById('user');
const info = document.getElementById('info');

// Show user info on user icon click
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


// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, getDocs, query, limit } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtsgwSa0T_b9GMESx1Tjhb1n4hohkJyOU",
    authDomain: "tasktrace-v2.firebaseapp.com",
    projectId: "tasktrace-v2",
    storageBucket: "tasktrace-v2.appspot.com",
    messagingSenderId: "863318084099",
    appId: "1:863318084099:web:6a9abab8d8893caaf9dc36",
    measurementId: "G-59DHK1FJ88"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch a single user data from Firestore and display it in the user-info div
// async function fetchUserData() {
//     const userInfoDiv = document.getElementById('info');
//     userInfoDiv.innerHTML = ''; // Clear previous data
//     const userQuery = query(collection(db, "user"), limit(1)); // Limit to one document
//     const querySnapshot = await getDocs(userQuery);

//     if (!querySnapshot.empty) {
//         const doc = querySnapshot.docs[0];
//         const userData = doc.data();
//         console.log(userData);
//         const userDiv = document.createElement('div');
//         userDiv.classList.add('user-data');
//         userDiv.innerHTML = `
//             <p><strong>Name:</strong> ${userData.name}</p>
//             <p><strong>Email:</strong> ${userData.email}</p>
//             <p><strong>Role:</strong> ${userData.role}</p>
//         `;
//         userInfoDiv.appendChild(userDiv);
//     } else {
//         userInfoDiv.innerHTML = '<p>No user data found.</p>';
//     }
// }

//collection ref
const colRef = collection(db, 'batches')

//get collection data
getDocs(colRef)
.then((snapshot) => {
    console.log(snapshot.docs);
})
