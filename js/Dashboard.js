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
 
 
// Fetch tag names from Firestore
async function fetchTagNames() {
  const tagNamesSet = new Set();
  const querySnapshot = await getDocs(collection(db, 'Marks'));
 
  querySnapshot.forEach((doc) => {
    const tagName = doc.data().TagName;
    if (tagName) {
      tagNamesSet.add(tagName);
    } else {
      console.error(`Undefined TagName in document ID: ${doc.id}`);
    }
  });
 
  return Array.from(tagNamesSet);
}
 
const tagNames = await fetchTagNames();
 
// Fetch task times and marks for each batch
async function fetchBatchData() {
  const batchData = {};
  const querySnapshot = await getDocs(collection(db, 'Marks'));
 
  querySnapshot.forEach((doc) => {
    const batchName = doc.data().BatchName;
    const tagName = doc.data().TagName;
    const members = doc.data().Members;
    
 
    if (!batchData[batchName]) {
      batchData[batchName] = {};
    }
 
    if (!batchData[batchName][tagName]) {
      batchData[batchName][tagName] = {
        totalTime: 0,
        taskCount: 0,
        totalScore:0,
      };
      
    }
 
    members.forEach((member) => {
      const tasks = member.Task;
      tasks.forEach((task) => {
        const score = task.Score;
        const timeInMilliseconds = parseInt(task.Time, 10);
        batchData[batchName][tagName].totalTime += timeInMilliseconds;
        batchData[batchName][tagName].totalScore += score;
      
        batchData[batchName][tagName].taskCount += 1;
      });
    });
   
  });
 
  return batchData;
}
 
// Calculate averages
async function calculateAverages() {
  try {
    const batchData = await fetchBatchData();
    const avgData = {
      labels: tagNames,
      avgTimes: {},
      avgScore: {},
    };
 
    for (const batchName in batchData) {
      avgData.avgTimes[batchName] = [];
      avgData.avgScore[batchName] = [];
      tagNames.forEach((tag) => {
        if (batchData[batchName][tag]) {
          const tagData = batchData[batchName][tag];
          const avgTimeInMilliseconds = tagData.totalTime / tagData.taskCount;
          const avgBatchScore = tagData.totalScore / tagData.taskCount;
          avgData.avgTimes[batchName].push(avgTimeInMilliseconds);
          avgData.avgScore[batchName].push(avgBatchScore);
        } else {
          avgData.avgScore[batchName].push(0); // No data for this tag in this batch
        }
      });
    }
 
    return avgData;
  } catch (error) {
    console.error('Error in calculateAverages:', error);
    return null;
  }
}
 
 
  const avgData = await calculateAverages();
  console.log(avgData);
 var color;
 //Chart 1
  // Initialize the chart with 'bar' type
  let chartType1 = "line";
  let chartType2 = "line";
  const chart1 = new Chart(chart_first_three, {
    type: chartType1,
    data: {
      labels: [0, ...tagNames,' '],
      datasets: Object.keys(avgData.avgScore).map((batchName) => ({
        label: batchName,
        backgroundColor: color=`#${Math.floor(Math.random() * 16777215).toString(16)}`,
        borderColor: color,
        data: [0,...avgData.avgScore[batchName],0] || [],
      })),
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
            text: "Average Marks", // Set your Y axis label here
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
      labels:[0,...tagNames,''] ,
      datasets: Object.keys(avgData.avgTimes).map((batchName) => ({
        label: batchName,
        backgroundColor: color=`#${Math.floor(Math.random() * 16777215).toString(16)}`,
        borderColor: color,
        data: [0,...avgData.avgTimes[batchName],0] || [],
      })),
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
            text: "Average Time (ms)", // Set your Y axis label here
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
  async function populateTableBody2() {
    const dropdown1 = document.getElementById("dropdown_1").value;
    const dropdown2 = document.getElementById("dropdown_2").value;
 
    const tableBody = document.getElementById("tableBody_second_three");
    tableBody.innerHTML = ""; // Clear previous contents
 
    try {
      const avgData = await calculateAverages(); // Get the average data
 
      // Iterate over tag names and create rows for the table
      tagNames.forEach((tag, index) => {
        const row = document.createElement("tr");
        const tagCell = document.createElement("td");
        const avgScoreCell1 = document.createElement("td");
        const avgScoreCell2 = document.createElement("td");
 
        tagCell.textContent = tag;
 
        // Access average scores using the index
        avgScoreCell1.textContent = avgData.avgScore[dropdown1]?.[index]
          ? avgData.avgScore[dropdown1][index].toFixed(2)
          : "0";
        console.log(avgScoreCell1.avgScore);
        avgScoreCell2.textContent = avgData.avgScore[dropdown2]?.[index]
          ? avgData.avgScore[dropdown2][index].toFixed(2)
          : "0";
 
        row.appendChild(tagCell);
        row.appendChild(avgScoreCell1);
        row.appendChild(avgScoreCell2);
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error("Error populating table body:", error);
    }
  }
  //  first pie chart--------------------------------------------------------
   // Function to toggle the visibility of dropdowns
function toggleDropdown() {
    const dropdowns = document.getElementById("batchDropdowns");
    dropdowns.style.display = dropdowns.style.display === "none" ? "block" : "none";
  }
   
  // Update the title based on the selected dropdown values
  function updateTitle() {
    const dropdown1 = document.getElementById("dropdown_1").value;
    console.log(dropdown1)
    const dropdown2 = document.getElementById("dropdown_2").value;
    const title = `Selected Batches: ${dropdown1} & ${dropdown2}`;
    document.getElementById("selectedBatchName").textContent = title;
  }
   
  // Call updateTitle whenever the dropdowns change
  document.getElementById("dropdown_1").addEventListener("change", updateTitle);
  document.getElementById("dropdown_2").addEventListener("change", updateTitle);
   
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
        const dropdown1 = document.getElementById("dropdown_1").value;
        console.log(dropdown1)
        console.log(avgData)
        console.log(avgData.avgScore[dropdown1])

        // Create dummy data for the pie chart
        const data = {
          labels: ["Tag1", "Tag2"],
          datasets: [
            {
              label: "Average Mark",
              data:avgData.avgScore[dropdown1],
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
                  text: dropdown1,
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
  async function populateTableBody() {
    const dropdown1 = document.getElementById("dropdown_1").value;
    const dropdown2 = document.getElementById("dropdown_2").value;
 
    const tableBody = document.getElementById("tableBody_first_four");
    tableBody.innerHTML = ""; // Clear previous contents
 
    try {
      const avgData = await calculateAverages(); // Get the average data
 
      // Helper function to convert milliseconds to HH:mm:ss format
      function millisecondsToTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
 
        const pad = (num) => String(num).padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
      }
 
      // Iterate over tag names and create rows for the table
      tagNames.forEach((tag, index) => {
        const row = document.createElement("tr");
        const tagCell = document.createElement("td");
        const avgTimeCell1 = document.createElement("td");
        const avgTimeCell2 = document.createElement("td");
 
        tagCell.textContent = tag;
 
        // Access average times using the index and format to HH:mm:ss
        avgTimeCell1.textContent = avgData.avgTimes[dropdown1]?.[index]
          ? millisecondsToTime(avgData.avgTimes[dropdown1][index])
          : "00:00:00";
 
        avgTimeCell2.textContent = avgData.avgTimes[dropdown2]?.[index]
          ? millisecondsToTime(avgData.avgTimes[dropdown2][index])
          : "00:00:00";
 
        row.appendChild(tagCell);
        row.appendChild(avgTimeCell1);
        row.appendChild(avgTimeCell2);
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error("Error populating table body:", error);
    }
  }
 
 
 
 
 
 
  //  secont pie chart--------------------------------------------------------
 
  // Function to toggle the visibility of dropdowns
function toggleDropdown() {
  const dropdowns = document.getElementById("batchDropdowns");
  dropdowns.style.display = dropdowns.style.display === "none" ? "block" : "none";
}
 
// Update the title based on the selected dropdown values
function updateTitle() {
  const dropdown1 = document.getElementById("dropdown_1").value;
  console.log(dropdown1)
  const dropdown2 = document.getElementById("dropdown_2").value;
  const title = `Selected Batches: ${dropdown1} & ${dropdown2}`;
  document.getElementById("selectedBatchName").textContent = title;
}
 
// Call updateTitle whenever the dropdowns change
document.getElementById("dropdown_1").addEventListener("change", updateTitle);
document.getElementById("dropdown_2").addEventListener("change", updateTitle);
 
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
        const dropdown1 = document.getElementById("dropdown_1").value;
        console.log(dropdown1)
        console.log(avgData)
        console.log(avgData.avgTimes[dropdown1])
 
        // Create dummy data for the pie chart
        const data = {
          labels:tagNames,
          datasets: [
            {
              label: "Average Time",
              data:avgData.avgTimes[dropdown1],
              backgroundColor: ["pink", "green"], // Adjust colors as needed
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
                  text: dropdown1,
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
    const batches = batchesSnapshot.docs.map((doc) => doc.data().BatchName);
    const uniqueBatches = [...new Set(batches)];
    const dropdown1 = document.getElementById("dropdown_1");
    const dropdown2 = document.getElementById("dropdown_2");
    
     // Clear existing options
     dropdown1.innerHTML = '';
     dropdown2.innerHTML = '';

    uniqueBatches.forEach((batch) => {
      const option1 = document.createElement("option");
      option1.value = batch;
      option1.text = batch;
      dropdown1.appendChild(option1);
 
      const option2 = document.createElement("option");
      option2.value = batch;
      option2.text = batch;
      dropdown2.appendChild(option2);
    });
 
    // Update table headers
    updateTableHeaders();
 
    // Add event listeners for dropdown changes
    dropdown1.addEventListener("change", updateTableHeaders);
    dropdown2.addEventListener("change", updateTableHeaders);
  } catch (error) {
    console.error("Error fetching batches:", error);
  }
}
 
function updateTableHeaders() {
  const dropdown1 = document.getElementById("dropdown_1");
  const dropdown2 = document.getElementById("dropdown_2");
 
  const batchNameColumn1 = document.getElementById("batchNameColumn1");
  const batchNameColumn2 = document.getElementById("batchNameColumn2");
  const batchNameColumn3 = document.getElementById("batchNameColumn3");
  const batchNameColumn4 = document.getElementById("batchNameColumn4");
 
  // Set the header text for the batch name columns
  batchNameColumn1.textContent = dropdown1.value ? `${dropdown1.value} Average Time` : 'Batch name Average Time';
  batchNameColumn2.textContent = dropdown2.value ? `${dropdown2.value} Average Time` : 'Batch name Average Time';
  batchNameColumn3.textContent = dropdown1.value ? `${dropdown1.value} Average Marks` : 'Batch name Average Marks';
  batchNameColumn4.textContent = dropdown2.value ? `${dropdown2.value} Average Marks` : 'Batch name Average Marks';
 
populateTableBody();
populateTableBody2();
}
 
// Call populateBatchDropdowns to fetch and populate data on load
await populateBatchDropdowns();
 
});