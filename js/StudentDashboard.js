document.addEventListener("DOMContentLoaded", function () {
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
  var DoughnutChart_first = document
    .getElementById("DoughnutChart_first")
    .getContext("2d");

  // Create a gradient for the "Obtained" segment
  var gradient = DoughnutChart_first.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(1, "#36A2EB");
  gradient.addColorStop(0, "#ffffff");

  // Create the custom plugin to draw text in the center
  const centerTextPlugin = {
    id: "centerTextPlugin",
    beforeDraw: function (chart) {
      var width = chart.width,
        height = chart.height,
        ctx = chart.ctx;

      ctx.restore();
      var fontSize = (height / 114).toFixed(2);
      ctx.font = "bold " + fontSize + "em sans-serif"; // Make the font bold
      ctx.textBaseline = "middle";

      var text1 = "70%",
        text2 = "Obtained",
        textX1 = Math.round((width - ctx.measureText(text1).width) / 2),
        textY1 = height / 2 - 10;

      // Set color for the "70%" text
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
  };

  // Create the Doughnut chart
  var myDoughnutChart = new Chart(DoughnutChart_first, {
    type: "doughnut",
    data: {
      labels: ["Obtained", "Remaining"],
      datasets: [
        {
          data: [70, 30], // 70% obtained out of 100%
          backgroundColor: [gradient, "#ffffff"], // Gradient for "Obtained" and solid color for "Remaining"
          hoverBackgroundColor: [gradient, "#FF6384"],
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "70%",
      plugins: {
        legend: {
          display: false, // Disable the legend
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
    plugins: [centerTextPlugin],
  });

  // New code for the second doughnut chart
  var DoughnutChart_second = document
    .getElementById("DoughnutChart_second")
    .getContext("2d");

  var gradientSecond = DoughnutChart_second.createLinearGradient(0, 0, 0, 400);
  gradientSecond.addColorStop(1, "#FF6384");
  gradientSecond.addColorStop(0, "#ffffff");

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

      ctx.fillStyle = "#FF6384";
      ctx.fillText(text1, textX1, textY1);

      var smallerFontSize = (height / 200).toFixed(2);
      ctx.font = "bold " + smallerFontSize + "em Georgia";

      var textX2 = Math.round((width - ctx.measureText(text2).width) / 2),
        textY2 = height / 2 + 20;

      ctx.fillStyle = "#FF6384";
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
          hoverBackgroundColor: [gradientSecond, "#FF6384"],
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
});
