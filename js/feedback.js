// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
     getFirestore, 
     collection, 
     addDoc,
    doc,
    getDocs,
    getDoc,
    query,
    orderBy,
    limit 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth();


// Function to handle form submission
document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get the selected rating
    let rating;
    const checkboxes = document.getElementsByName('rating');
    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            rating = checkbox.value;
        }
    });

    // Get the feedback text
    const feedbackText = document.getElementById('feedbackText').value;

    // Get the currently signed-in user
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                // Add a new document with a generated ID in the 'new_feedback' collection
                await addDoc(collection(db, 'new_feedback'), {
                    rating: rating,
                    feedbackText: feedbackText,
                    uid: user.uid,
                    timestamp: new Date()
                });
                alert('Feedback submitted successfully!');
                // Reset the form
                document.getElementById('feedbackForm').reset();
            } catch (error) {
                console.error('Error adding document: ', error);
                alert('Error submitting feedback. Please try again.');
            }
        } else {
            alert('No user is signed in.');
        }
    });
});

// Fetch user data and update UI
function fetchUserData() {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
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