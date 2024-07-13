import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtsgwSa0T_b9GMESx1Tjhb1n4hohkJyOU",
  authDomain: "tasktrace-v2.firebaseapp.com",
  projectId: "tasktrace-v2",
  storageBucket: "tasktrace-v2.appspot.com",
  messagingSenderId: "863318084099",
  appId: "1:863318084099:web:6a9abab8d8893caaf9dc36",
  measurementId: "G-59DHK1FJ88",
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
  const chart1 = new Chart(chart_first_three, {
    type: chartType1,
    data: {
      labels: [0, "Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "B1",
          backgroundColor: "#342567",
          borderColor: "#342567",
          data: [0, 17, 19, 3, 5, 2, 3],
          borderWidth: 1.5,
        },
        {
          label: "B2",
          backgroundColor: "#345557",
          borderColor: "#345557",
          data: [0, 12, 9, 6, 8, 2, 6],
          borderWidth: 1.5,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          align: "end",
          labels: {
            usePointStyle: true,
            pointStyle: "rectRounded",
          },
        },
      },
      animation: {
        duration: 2000, // Animation duration in milliseconds
        easing: "bounce", // Animation effect
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Marks Percentage", // Set your Y axis label here
            font: {
              size: 14,
              weight: "bold",
            },
            color: "black",
          },
        },
        x: {
          title: {
            display: true,
            text: "Task Tags", // Set your X axis label here
            font: {
              size: 14,
              weight: "bold",
            },
            color: "black",
          },
        },
      },
    },
  });

  // Toggle chart type on button click
  document
    .getElementById("switch_button_checkbox_first_three")
    .addEventListener("click", function () {
      // Toggle chart type
      chartType1 = chartType1 === "bar" ? "line" : "bar";
      chart1.config.type = chartType1;
      chart1.update(); // Update the chart to reflect changes
    });

  // chart2............

  const chart2 = new Chart(chart_second_four, {
    type: chartType2,
    data: {
      labels: [0, "Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "B1",
          backgroundColor: "#f11167",
          borderColor: "#f11167",
          data: [0, 1, 9, 13, 15, 8, 8],
          borderWidth: 1.5,
        },
        {
          label: "B2",
          backgroundColor: "#341111",
          borderColor: "#341111",
          data: [0, 11, 19, 16, 0, 0, 16],
          borderWidth: 1.5,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          align: "end",
          labels: {
            usePointStyle: true,
            pointStyle: "rectRounded",
          },
        },
      },
      animation: {
        duration: 2000, // Animation duration in milliseconds
        easing: "bounce", // Animation effect
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Time", // Set your Y axis label here
            font: {
              size: 14,
              weight: "bold",
            },
            color: "black",
          },
        },
        x: {
          title: {
            display: true,
            text: "Task Tags", // Set your X axis label here
            font: {
              size: 14,
              weight: "bold",
            },
            color: "black",
          },
        },
      },
    },
  });

  // Toggle chart type on button click
  document
    .getElementById("switch_button_checkbox_second_four")
    .addEventListener("click", function () {
      // Toggle chart type
      chartType2 = chartType2 === "bar" ? "line" : "bar";
      chart2.config.type = chartType2;
      chart2.update(); // Update the chart to reflect changes
    });
  // first table population--------------------------------------
  const tableBody_second_three = document.getElementById(
    "tableBody_second_three"
  );

  //  first pie chart--------------------------------------------------------

  let piCheckbox_second_three_flag = false;
  document
    .getElementById("piCheckbox_second_three")
    .addEventListener("change", function () {
      const tableDiv = document.getElementById("second_three2");
      const chartContainer_second_three2 = document.getElementById(
        "chartContainer_second_three2"
      );

      if (this.checked) {
        // Hide the table and show the chart
        tableDiv.style.display = "none";
        chartContainer_second_three2.style.display = "block";

        // Create dummy data for the pie chart
        const data = {
          labels: ["Tag1", "Tag2"],
          datasets: [
            {
              label: "Average Mark",
              data: [87.5, 77.5],
              backgroundColor: ["Red", "Blue"],
            },
          ],
        };
        if (!piCheckbox_second_three_flag) {
          piCheckbox_second_three_flag = true;
          // Create the pie chart
          const ctx = document
            .getElementById("pieChart_second_three2")
            .getContext("2d");
          new Chart(ctx, {
            type: "pie",
            data: data,
            options: {
              plugins: {
                legend: {
                  labels: {
                    usePointStyle: true,
                    pointStyle: "rectRounded",
                  },
                },
                title: {
                  display: true,
                  text: "Batch Name",
                  align: "start",
                  color: "black",
                },
              },
            },
          });
        }
      } else {
        // Show the table and hide the chart
        tableDiv.style.display = "block";
        chartContainer_second_three2.style.display = "none";
      }
    });

  // second table population--------------------------------------
  const tableBody_first_four = document.getElementById("tableBody_first_four");

  //  secont pie chart--------------------------------------------------------

  let piCheckbox_first_four_flag = false;
  document
    .getElementById("piCheckbox_first_four")
    .addEventListener("change", function () {
      const tableDiv = document.getElementById("first_four2");
      const chartContainer_first_four2 = document.getElementById(
        "chartContainer_first_four2"
      );

      if (this.checked) {
        // Hide the table and show the chart
        tableDiv.style.display = "none";
        chartContainer_first_four2.style.display = "block";

        // Create dummy data for the pie chart
        const data = {
          labels: ["Tag1", "Tag2"],
          datasets: [
            {
              label: "Average Mark",
              data: [87.5, 77.5],
              backgroundColor: ["pink", "green"],
            },
          ],
        };
        if (!piCheckbox_first_four_flag) {
          piCheckbox_first_four_flag = true;
          // Create the pie chart
          const ctx = document
            .getElementById("pieChart_first_four2")
            .getContext("2d");
          new Chart(ctx, {
            type: "pie",
            data: data,
            options: {
              plugins: {
                legend: {
                  labels: {
                    usePointStyle: true,
                    pointStyle: "rectRounded",
                  },
                },
                title: {
                  display: true,
                  text: "Batch Name",
                  align: "start",
                  color: "black",
                },
              },
            },
          });
        }
      } else {
        // Show the table and hide the chart
        tableDiv.style.display = "block";
        chartContainer_first_four2.style.display = "none";
      }
    });

  // Fetch and populate batches
  async function populateBatchDropdowns() {
    try {
      console.log("Fetching batches...");
      const batchesSnapshot = await getDocs(collection(db, "Marks"));
      console.log("Batches fetched:", batchesSnapshot);

      const batches = batchesSnapshot.docs.map((doc) => {
        console.log("Document data:", doc.data());
        return doc.data().BatchName;
      });
      console.log("Batches data:", batches);

      const dropdown1 = document.getElementById("dropdown_1");
      const dropdown2 = document.getElementById("dropdown_2");

      batches.forEach((batch) => {
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
