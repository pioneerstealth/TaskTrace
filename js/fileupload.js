// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  getDocs,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGVP2-tmrfh9VziN4EfSTSEOr9DIj1r8k",
  authDomain: "task-trace.firebaseapp.com",
  projectId: "task-trace",
  storageBucket: "task-trace.appspot.com",
  messagingSenderId: "542109212256",
  appId: "1:542109212256:web:a54bd96c131eff4a152d05",
  measurementId: "G-MZNCSCVN54",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const database = getFirestore(app);
const auth = getAuth();

// Image upload

// Variable initialization
let ImgName, ImgUrl;
let files = [];
let reader = new FileReader();

// Selection process
document.getElementById("select").onclick = function (e) {
  const input = document.getElementById('uploadPDF');
  input.id = "fileinput";
  input.type = "file";
  input.click();

  input.onchange = (e) => {
    const file = input.files[0];
    files[0] =file;
    console.log(files.length);

    if (file && file.type === 'application/pdf') {
        const fileURL = URL.createObjectURL(file);
        document.getElementById('pdfCanvas').style="display:block";
        renderPDF(fileURL);
    } 
    else if (file && file.type.startsWith('image/')) {

      document.getElementById('pdfCanvas').style="display:block";
      const fileURL = URL.createObjectURL(file);

    // Get the canvas element and context
    const canvas = document.getElementById('pdfCanvas');
    const context = canvas.getContext('2d');

    // Create a new Image object
    const img = new Image();
    img.src = fileURL;

    // When the image is loaded, draw it on the canvas
    img.onload = function() {
        // Set canvas dimensions to match the image dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image on the canvas
        context.drawImage(img, 0, 0);

        // Clean up the object URL
        URL.revokeObjectURL(fileURL);
    };

    // Handle errors
    img.onerror = function() {
        console.error('Failed to load the image.');
        URL.revokeObjectURL(fileURL);
    };
    }
    else {
        alert('Please upload a valid PDF file.');
    }
  };
};


function renderPDF(url) {
  const canvas = document.getElementById('pdfCanvas');
  const context = canvas.getContext('2d');

  // Load the PDF document
  pdfjsLib.getDocument(url).promise.then(pdf => {
      // Fetch the first page
      pdf.getPage(1).then(page => {
          const viewport = page.getViewport({ scale: 1.5 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // Render the page into the canvas context
          const renderContext = {
              canvasContext: context,
              viewport: viewport
          };
          page.render(renderContext);
      });
  }).catch(error => {
      console.error('Error loading PDF: ', error);
      alert('An error occurred while loading the PDF.');
  });
}

// Upload process
document.getElementById("upload").onclick = function () {
  const ImgName = document.getElementById("namebox").value.trim();
  const taskId = localStorage.getItem("taskId");
  
  console.log("taskId");// Replace with the actual task ID

  if (files.length > 0) {
    const storageRef = ref(storage, "Images/" + ImgName + ".png");
    const uploadTask = uploadBytesResumable(storageRef, files[0]);

    uploadTask.on(
      "state_changed",
      function (snapshot) {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        document.getElementById("UpProgress").innerHTML =
          "Upload " + progress + "%";
      },
      function (error) {
        alert("Error in saving image: " + error.message);
      },
      function () {
        getDownloadURL(uploadTask.snapshot.ref).then(function (downloadURL) {
          const ImgUrl = downloadURL;
          const user = auth.currentUser;

          if (!user) {
            alert("User not logged in");
            return;
          }

          const userEmail = user.email;
          const taskDocRef = doc(database, "tasks", taskId);

          getDoc(taskDocRef)
            .then((taskDoc) => {
              if (taskDoc.exists()) {
                const taskData = taskDoc.data();

                if (!taskData.students || !Array.isArray(taskData.students)) {
                  console.log(
                    `Task ${taskId} does not have a valid students array.`
                  );
                  return;
                }

                let userFound = false;
                const updatedStudents = taskData.students.map((student) => {
                  if (String(student.email).toLowerCase() === String(userEmail).toLowerCase()) {
                    userFound = true;
                    return {
                      ...student,
                      imgurl: ImgUrl,
                      submissionStatus: "Completed",
                    };
                  } else {
                    return student;
                  }                  
                });

                if (userFound) {
                  updateDoc(taskDocRef, {
                    students: updatedStudents,
                    taskStatus: "Completed",
                  })
                    .then(() => {
                      console.log(`Task ${taskId} updated successfully.`);
                    })
                    .catch((error) => {
                      console.error(`Error updating task ${taskId}: `, error);
                    });
                } else {
                  console.log("User email not found in the task.");
                }
              } else {
                console.log("Task not found.");
              }
            })
            .catch((error) => {
              console.error("Error retrieving task: ", error);
            });

          setDoc(doc(database, "ImagesLinks", ImgName), {
            ImageName: ImgName,
            ImageURL: ImgUrl,
          })
            .then(() => {
              console.log("Image URL saved successfully.");
            })
            .catch((error) => {
              console.error("Error saving image URL: ", error);
            });
        });
      }
    );
  } else {
    alert("No image selected.");
  }
};

