document.addEventListener("DOMContentLoaded", function () {
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
          borderWidth: 1,
        },
        {
          label: "B2",
          backgroundColor: "#345557",
          borderColor: "#345557",
          data: [12, 9, 6, 8, 2, 6],
          borderWidth: 1,
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
      labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "B1",
          backgroundColor: "#f11167",
          borderColor: "#f11167",
          data: [1, 9, 13, 15, 8, 8],
          borderWidth: 1,
        },
        {
          label: "B2",
          backgroundColor: "#341111",
          borderColor: "#341111",
          data: [11, 19, 16, 0, 0, 16],
          borderWidth: 1,
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

  // chart3............

  const chart3 = new Chart(chart_first_five, {
    type: chartType3,
    data: {
      labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "B1",
          backgroundColor: "#f1a16f",
          borderColor: "#f1a16f",
          data: [1, 9, 13, 15, 8, 8],
          borderWidth: 1,
        },
        {
          label: "B2",
          backgroundColor: "#34ff11",
          borderColor: "#34ff11",
          data: [11, 19, 16, 0, 0, 16],
          borderWidth: 1,
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
        },
      },
    },
  });

  // Toggle chart type on button click
  document
    .getElementById("switch_button_checkbox_first_five")
    .addEventListener("click", function () {
      // Toggle chart type
      chartType3 = chartType3 === "bar" ? "line" : "bar";
      chart3.config.type = chartType3;
      chart3.update(); // Update the chart to reflect changes
    });
});
