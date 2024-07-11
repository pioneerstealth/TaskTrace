document.addEventListener("DOMContentLoaded", function () {
  // pie chart----------------------------------------------------------------
  // Select the canvas element
  const ctx = document.getElementById("first_piChart").getContext("2d");

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
  const myPieChart = new Chart(ctx, config);
});
