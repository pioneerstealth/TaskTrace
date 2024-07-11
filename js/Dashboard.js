import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", async function () {
  const chart_first_three = document.getElementById("chart_first_three");
  const chart_second_four = document.getElementById("chart_second_four");

  // Initialize the chart with 'bar' type
  let chartType1 = "line";
  let chartType2 = "line";
  let chartType3 = "line";
  const chart1 = new Chart(chart_first_three, {
    type: chartType1,
    data: {
      labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "B1",
          backgroundColor: "#342567",
          borderColor: "#342567",
          data: [17, 19, 3, 5, 2, 3],
          borderWidth: 1.5
        },
        {
          label: "B2",
          backgroundColor: "#345557",
          borderColor: "#345557",
          data: [12, 9, 6, 8, 2, 6],
          borderWidth: 1.5
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          align: "end",
          labels: {
            usePointStyle: true,
            pointStyle: "rectRounded"
          }
        }
      },
      animation: {
        duration: 2000, // Animation duration in milliseconds
        easing: "bounce" // Animation effect
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Toggle chart type on button click
  document.getElementById("switch_button_checkbox_first_three").addEventListener("click", function () {
    // Toggle chart type
    chartType1 = chartType1 === "bar" ? "line" : "bar";
    chart1.config.type = chartType1;
    chart1.update(); // Update the chart to reflect changes
  });

  // chart2............

  const chart2 = new Chart(chart_second_four, {
    type: chartType2,
    data: {
      labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "B1",
          backgroundColor: "#f11167",
          borderColor: "#f11167",
          data: [1, 9, 13, 15, 8, 8],
          borderWidth: 1.5
        },
        {
          label: "B2",
          backgroundColor: "#341111",
          borderColor: "#341111",
          data: [11, 19, 16, 0, 0, 16],
          borderWidth: 1.5
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          align: "end",
          labels: {
            usePointStyle: true,
            pointStyle: "rectRounded"
          }
        }
      },
      animation: {
        duration: 2000, // Animation duration in milliseconds
        easing: "bounce" // Animation effect
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Toggle chart type on button click
  document.getElementById("switch_button_checkbox_second_four").addEventListener("click", function () {
    // Toggle chart type
    chartType2 = chartType2 === "bar" ? "line" : "bar";
    chart2.config.type = chartType2;
    chart2.update(); // Update the chart to reflect changes
  });

  // Fetch batches from Firestore and populate dropdowns
  async function populateBatchDropdowns() {
    try {
      console.log("Fetching batches...");
      const batchesSnapshot = await getDocs(collection(db, "batches"));
      console.log("Batches fetched:", batchesSnapshot);

      const batches = batchesSnapshot.docs.map(doc => doc.data().batchName);
      console.log("Batches data:", batches);

      const dropdown1 = document.getElementById("dropdown_1");
      const dropdown2 = document.getElementById("dropdown_2");

      batches.forEach(batch => {
        const option1 = document.createElement("option");
        option1.value = batch;
        option1.text = batch;
        dropdown1.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = batch;
        option2.text = batch;
        dropdown2.appendChild(option2);
      });
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  }

  await populateBatchDropdowns();
});
