// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

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
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const memberId = params.get("memberId");
  const batchId = params.get("batchId");

  //fetch batch name and student name function----------------------------------------
  async function fetchBatchNameAndStudentName(documentId, memberId) {
    try {
      const docRef = doc(db, "batches", documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const batchName = data.batchName;

        // Find student name from members array
        const member = data.members.find((member) => member.id === memberId);
        const studentName = member ? member.name : "Student not found";

        first_imgHead_heading_populate(batchName, studentName);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  }

  // Example usage
  fetchBatchNameAndStudentName(batchId, memberId);

  // div clear function-----------------------------------------------------

  function clearDivContent(divId) {
    var div = document.getElementById(divId);
    if (div) {
      div.innerHTML = "";
    } else {
      console.error("No element found with the id:", divId);
    }
  }

  // first_imgHead_heading population-----------------------------------------

  function first_imgHead_heading_populate(batchName, studentName) {
    let divId = "first_imgHead_heading";
    clearDivContent(divId);
    const div = document.getElementById("first_imgHead_heading");
    if (div) {
      div.innerHTML = `${studentName} <br /> ${batchName}`;
    } else {
      console.error("Element with class 'first_imgHead_heading' not found.");
    }
  }

  //average name with tag student and batch---------------------------------------------
  async function calculateAverageMark(batchId, tagName, studentId) {
    // Get tasks from Firestore
    const tasksRef = collection(db, "tasks");
    const q = query(
      tasksRef,
      where("batchId", "==", batchId),
      where("tagName", "==", tagName)
    );
    const querySnapshot = await getDocs(q);

    let totalPercentage = 0;
    let taskCount = 0;

    querySnapshot.forEach((doc) => {
      const task = doc.data();
      const maxMarks = parseFloat(task.maxMarks);
      const student = task.students.find((student) => student.id === studentId);

      if (student && maxMarks) {
        const studentMarks = parseFloat(student.marks);
        const percentage = (studentMarks / maxMarks) * 100;
        totalPercentage += percentage;
        taskCount++;
      }
    });

    if (taskCount === 0) {
      return 0; // If no tasks are found, return 0
    }

    return totalPercentage / taskCount;
  }

  // const tagName = "JAVA";
  // const studentId = memberId;
  // calculateAverageMark(batchId, tagName, memberId)
  //   .then((averageMark) => {
  //     console.log(
  //       `Average mark percentage for student ${studentId} in tag ${tagName}: ${averageMark}%`
  //     );
  //   })
  //   .catch((error) => {
  //     console.error("Error calculating average mark percentage:", error);
  //   });

  //store tagname------------------------------

  async function getUniqueTagNames(batchId) {
    // Get tasks from Firestore
    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("batchId", "==", batchId));
    const querySnapshot = await getDocs(q);

    const uniqueTagNames = new Set();

    querySnapshot.forEach((doc) => {
      const task = doc.data();
      if (task.tagName) {
        uniqueTagNames.add(task.tagName);
      }
    });

    // Convert the set to an array
    const tagNamesArray = Array.from(uniqueTagNames);

    // Display the unique tag names
    // console.log(`Unique tag names for batch ${batchId}:`, tagNamesArray);

    return tagNamesArray;
  }

  try {
    const tagNamesArray = await getUniqueTagNames(batchId);
    console.log("Tag names retrieved successfully:", tagNamesArray);

    let totalPercentage = 0;

    for (const tagName of tagNamesArray) {
      const averageMark = await calculateAverageMark(
        batchId,
        tagName,
        memberId
      );
      totalPercentage += averageMark;
      console.log(
        `Average mark percentage for student ${memberId} in tag ${tagName}: ${averageMark}%`
      );
    }

    const overallPercentage = totalPercentage / tagNamesArray.length;
    console.log(
      `Overall average percentage for student ${memberId}: ${overallPercentage}%`
    );

    // Update the Chart.js data dynamically
    const DoughnutChart_first = document
      .getElementById("DoughnutChart_first")
      .getContext("2d");
    const gradient = DoughnutChart_first.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(1, "#36A2EB");
    gradient.addColorStop(0, "#EAF5FD");

    const remainingPercentage = 100 - overallPercentage;

    // Create the Doughnut chart
    const myDoughnutChart = new Chart(DoughnutChart_first, {
      type: "doughnut",
      data: {
        labels: ["Obtained", "Remaining"],
        datasets: [
          {
            data: [overallPercentage, remainingPercentage],
            backgroundColor: [gradient, "#ffffff"],
            hoverBackgroundColor: [gradient, "#ff0000"],
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "70%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return tooltipItem.label + ": " + tooltipItem.raw + "%";
              },
            },
          },
        },
      },
      plugins: [
        {
          id: "centerTextPlugin",
          beforeDraw: function (chart) {
            var width = chart.width,
              height = chart.height,
              ctx = chart.ctx;

            ctx.restore();
            var fontSize = (height / 114).toFixed(2);
            ctx.font = "bold " + fontSize + "em sans-serif"; // Make the font bold
            ctx.textBaseline = "middle";

            var text1 = `${overallPercentage.toFixed(2)}%`,
              text2 = "Obtained",
              textX1 = Math.round((width - ctx.measureText(text1).width) / 2),
              textY1 = height / 2 - 10;

            // Set color for the "overallPercentage" text
            ctx.fillStyle = "#36A2EB"; // Change this color as needed
            ctx.fillText(text1, textX1, textY1);

            // Adjust font size for the smaller "obtained" text
            var smallerFontSize = (height / 200).toFixed(2); // Adjust the value to make it smaller
            ctx.font = "bold " + smallerFontSize + "em Georgia";

            var textX2 = Math.round((width - ctx.measureText(text2).width) / 2),
              textY2 = height / 2 + 20;

            // Set color for the "obtained" text
            ctx.fillStyle = "#36A2EB"; // Change this color as needed
            ctx.fillText(text2, textX2, textY2);

            ctx.save();
          },
        },
      ],
    });
  } catch (error) {
    console.error("Error:", error);
  }

  // Example usage

  // getUniqueTagNames(batchId)
  //   .then((tagNames) => {
  //     const tagNamesArray = tagNames;
  //     console.log("Tag names retrieved successfully:", tagNamesArray);

  //     // Store the tag names array for further use
  //     // You can now use tagNamesArray for other operations
  //   })
  //   .catch((error) => {
  //     console.error("Error retrieving tag names:", error);
  //   });

  // Call the function with the parameters from the URL
  // fetchBatchAndMemberInfo(memberId, batchId);

  // pie chart----------------------------------------------------------------
  // Select the canvas element
  const first_piChart = document
    .getElementById("first_piChart")
    .getContext("2d");

  // Data for the pie chart
  const data = {
    labels: ["Completed Tasks", "Time Extended Tasks", "Not Completed Tasks"],
    datasets: [
      {
        data: [30, 20, 50], // Dummy data
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(255, 99, 132, 0.2)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Configuration options for the pie chart
  const config = {
    type: "pie",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom", // Position the legend below the chart
          align: "start", // Align the legend to the left
          labels: {
            // usePointStyle: true,
            pointStyle: "rectRounded",
          },
        },
        tooltip: {
          enabled: true,
        },
      },
    },
  };

  // Create the pie chart
  const myPieChart = new Chart(first_piChart, config);

  // donutchart-------------------------------------------
  // Get the context of the canvas element we just created

  // var DoughnutChart_first = document
  //   .getElementById("DoughnutChart_first")
  //   .getContext("2d");

  // // Create a gradient for the "Obtained" segment
  // var gradient = DoughnutChart_first.createLinearGradient(0, 0, 0, 400);
  // gradient.addColorStop(1, "#36A2EB");
  // gradient.addColorStop(0, "#EAF5FD");

  // // Create the custom plugin to draw text in the center
  // const centerTextPlugin = {
  //   id: "centerTextPlugin",
  //   beforeDraw: function (chart) {
  //     var width = chart.width,
  //       height = chart.height,
  //       ctx = chart.ctx;

  //     ctx.restore();
  //     var fontSize = (height / 114).toFixed(2);
  //     ctx.font = "bold " + fontSize + "em sans-serif"; // Make the font bold
  //     ctx.textBaseline = "middle";

  //     var text1 = "70%",
  //       text2 = "Obtained",
  //       textX1 = Math.round((width - ctx.measureText(text1).width) / 2),
  //       textY1 = height / 2 - 10;

  //     // Set color for the "70%" text
  //     ctx.fillStyle = "#36A2EB"; // Change this color as needed
  //     ctx.fillText(text1, textX1, textY1);

  //     // Adjust font size for the smaller "obtained" text
  //     var smallerFontSize = (height / 200).toFixed(2); // Adjust the value to make it smaller
  //     ctx.font = "bold " + smallerFontSize + "em Georgia";

  //     var textX2 = Math.round((width - ctx.measureText(text2).width) / 2),
  //       textY2 = height / 2 + 20;

  //     // Set color for the "obtained" text
  //     ctx.fillStyle = "#36A2EB"; // Change this color as needed
  //     ctx.fillText(text2, textX2, textY2);

  //     ctx.save();
  //   },
  // };

  // // Create the Doughnut chart
  // var myDoughnutChart = new Chart(DoughnutChart_first, {
  //   type: "doughnut",
  //   data: {
  //     labels: ["Obtained", "Remaining"],
  //     datasets: [
  //       {
  //         data: [70, 30], // 70% obtained out of 100%
  //         backgroundColor: [gradient, "#ffffff"], // Gradient for "Obtained" and solid color for "Remaining"
  //         hoverBackgroundColor: [gradient, "#ff0000"],
  //       },
  //     ],
  //   },
  //   options: {
  //     responsive: true,
  //     cutout: "70%",
  //     plugins: {
  //       legend: {
  //         display: false, // Disable the legend
  //       },
  //       tooltip: {
  //         callbacks: {
  //           label: function (tooltipItem) {
  //             return tooltipItem.label + ": " + tooltipItem.raw + "%";
  //           },
  //         },
  //       },
  //     },
  //   },
  //   plugins: [centerTextPlugin],
  // });

  // New code for the second doughnut chart
  var DoughnutChart_second = document
    .getElementById("DoughnutChart_second")
    .getContext("2d");

  var gradientSecond = DoughnutChart_second.createLinearGradient(0, 0, 0, 400);
  gradientSecond.addColorStop(1, "#57C16B");
  gradientSecond.addColorStop(0, "#DDF2E1");

  const centerTextPluginSecond = {
    id: "centerTextPluginSecond",
    beforeDraw: function (chart) {
      var width = chart.width,
        height = chart.height,
        ctx = chart.ctx;

      ctx.restore();
      var fontSize = (height / 114).toFixed(2);
      ctx.font = "bold " + fontSize + "em sans-serif";
      ctx.textBaseline = "middle";

      var text1 = "60%",
        text2 = "Required",
        textX1 = Math.round((width - ctx.measureText(text1).width) / 2),
        textY1 = height / 2 - 10;

      ctx.fillStyle = "#57C16B";
      ctx.fillText(text1, textX1, textY1);

      var smallerFontSize = (height / 200).toFixed(2);
      ctx.font = "bold " + smallerFontSize + "em Georgia";

      var textX2 = Math.round((width - ctx.measureText(text2).width) / 2),
        textY2 = height / 2 + 20;

      ctx.fillStyle = "#57C16B";
      ctx.fillText(text2, textX2, textY2);

      ctx.save();
    },
  };

  var myDoughnutChartSecond = new Chart(DoughnutChart_second, {
    type: "doughnut",
    data: {
      labels: ["Required", "Remaining"],
      datasets: [
        {
          data: [60, 40],
          backgroundColor: [gradientSecond, "#ffffff"],
          hoverBackgroundColor: [gradientSecond, "#FF0000"],
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "70%",
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              return tooltipItem.label + ": " + tooltipItem.raw + "%";
            },
          },
        },
      },
    },
    plugins: [centerTextPluginSecond],
  });

  // chart1----------------------------------------------

  // Chart setup for the second chart in 'first_two' div
  let chartType2 = "line";

  // Create the new chart
  const chart_second_four = document.getElementById("chart_first_two"); // Get the new canvas element

  const chart2 = new Chart(chart_second_four, {
    type: chartType2,
    data: {
      labels: [0, "Red", "Blue", "Yellow", "Green", "Purple", "Orange", ""],
      datasets: [
        {
          label: "Batch",
          backgroundColor: "#f11167",
          borderColor: "#f11167",
          data: [0, 1, 9, 13, 15, 8, 8],
          borderWidth: 1.5,
        },
        {
          label: "Individual",
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
            text: "Average Mark", // Set your Y axis label here
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
    .getElementById("switch_button_checkbox_first_two")
    .addEventListener("click", function () {
      // Toggle chart type
      chartType2 = chartType2 === "bar" ? "line" : "bar";
      chart2.config.type = chartType2;
      chart2.update(); // Update the chart to reflect changes
    });

  // JavaScript to populate the dropdown options-----------------------------------------
  var dropdown = document.getElementById("taskStatusDropdown");
  var options = [
    "Completed Tasks",
    "Time extended Tasks",
    "Not completed Tasks",
  ];

  options.forEach(function (optionText) {
    var option = document.createElement("option");
    option.text = optionText;
    option.value = optionText.toLowerCase().replace(/ /g, "_");
    dropdown.appendChild(option);
  });
});
