<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const data = ref({});
let lineChartInstance = null;
let pieChartInstance = null;
let barChartInstance = null;

onMounted(async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/dashboard/legal", {
            headers: { Authorization: `Bearer ${token}` }
        });
        data.value = res.data;
        renderCharts();
    } catch (err) {
        console.error(err);
    }
});

function renderCharts() {
    if (!data.value) return;

    // --- Line Chart ---
    const lineLabels = Object.keys(data.value.lineChart || {});
    // แก้ไขสีให้ตรงกับรูปภาพ
    const suggestionData = lineLabels.map(d => data.value.lineChart[d]?.suggestion ?? 0);
    const complaintData = lineLabels.map(d => data.value.lineChart[d]?.complaint ?? 0);
    const corruptionData = lineLabels.map(d => data.value.lineChart[d]?.corruption ?? 0);
    const evaluationData = lineLabels.map(d => data.value.lineChart[d]?.evaluation ?? 0);

    const lineCtx = document.getElementById("lineChart").getContext("2d");
    if (lineChartInstance) lineChartInstance.destroy();
    lineChartInstance = new Chart(lineCtx, {
        type: "line",
        data: {
            labels: lineLabels,
            datasets: [
                // แก้ไขสีให้ตรงกับรูปภาพ
                { label: "Suggestion", data: suggestionData, borderColor: "#7189a8", backgroundColor: "#7189a8", fill: false, tension: 0.4, pointRadius: 5, pointBackgroundColor: "white" },
                { label: "Complaint", data: complaintData, borderColor: "#5e9b53", backgroundColor: "#5e9b53", fill: false, tension: 0.4, pointRadius: 5, pointBackgroundColor: "white" },
                { label: "Corruption", data: corruptionData, borderColor: "#d19a4e", backgroundColor: "#d19a4e", fill: false, tension: 0.4, pointRadius: 5, pointBackgroundColor: "white" },
                { label: "Evaluation", data: evaluationData, borderColor: "#a46450", backgroundColor: "#a46450", fill: false, tension: 0.4, pointRadius: 5, pointBackgroundColor: "white" }
            ]
        },
        options: { 
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'amount'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Day'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });

    // --- Pie Chart ---
    const pieData = [
        parseFloat(data.value.pieChart?.suggestion ?? 0),
        parseFloat(data.value.pieChart?.complaint ?? 0),
        parseFloat(data.value.pieChart?.corruption ?? 0),
        parseFloat(data.value.pieChart?.evaluation ?? 0)
    ];
    const pieCtx = document.getElementById("pieChart").getContext("2d");
    if (pieChartInstance) pieChartInstance.destroy();
    pieChartInstance = new Chart(pieCtx, {
        type: "pie",
        data: {
            labels: ["Suggestion", "Complaint", "Corruption", "Evaluation"],
            datasets: [{ data: pieData, backgroundColor: ["#7189a8", "#5e9b53", "#d19a4e", "#a46450"] }]
        },
        options: { responsive: true }
    });

    // --- Bar Chart ---
    if (data.value.barChart) {
        const barLabels = Object.keys(data.value.barChart);
        const barData = Object.values(data.value.barChart).map(v => v ?? 0);
        const barCtx = document.getElementById("barChart").getContext("2d");
        if (barChartInstance) barChartInstance.destroy();
        barChartInstance = new Chart(barCtx, {
            type: "bar",
            data: {
                labels: barLabels,
                datasets: [{ label: "Forwarded Corruptions", data: barData, backgroundColor: "#a46450" }]
            },
            options: { responsive: true }
        });
    }
}
</script>

<template>
  <div class="position-wrapper">
    <h1>⚖️ Legal Dashboard</h1>

    <div class="grid-boxcount">
      <div class="card suggestion">
        <p>Suggestion</p>
        <h2>{{ data.boxCount?.suggestion ?? 0 }}</h2>
      </div>
      <div class="card complaint">
        <p>Complaint</p>
        <h2>{{ data.boxCount?.complaint ?? 0 }}</h2>
      </div>
      <div class="card corruption">
        <p>Corruption</p>
        <h2>{{ data.boxCount?.corruption ?? 0 }}</h2>
      </div>
      <div class="card evaluation">
        <p>Evaluation</p>
        <h2>{{ data.boxCount?.evaluation ?? 0 }}</h2>
      </div>
      <div class="card evaluation">
        <p>Evaluation submissions</p>
        <h2>{{ data.boxCount?.evaluationResponses ?? 0 }}</h2>
      </div>
    </div>

    <div class="grid-charts">
      <div class="chart-section">
        <h3>Daily Cases</h3>
        <canvas id="lineChart"></canvas>
      </div>
      <div class="chart-section">
        <h3>Case Type Ratio</h3>
        <canvas id="pieChart"></canvas>
      </div>

      <div class="status-box complaint-box">
        <p>Complaint</p>
        <div class="status-count on-process">On process: {{ data.statusBox?.onProcess ?? 0 }}</div>
        <div class="status-count finished">Finish: {{ data.statusBox?.finished ?? 0 }}</div>
      </div>

      <div class="status-box corruption-box">
        <p>Corruption</p>
        <div class="status-count on-process">On process: {{ data.statusBox?.onProcess ?? 0 }}</div>
        <div class="status-count finished">Finish: {{ data.statusBox?.finished ?? 0 }}</div>
      </div>

      <div class="score-box">
        <p>Score your work</p>
        <div class="score-bar very-good">Very Good 25</div>
        <div class="score-bar good">Good 20</div>
        <div class="score-bar improve">Improve 10</div>
      </div>
    </div>

    <div class="bar-chart-section">
      <h3>Complaints by Referred Department</h3>
      <canvas id="barChart"></canvas>
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Segoe UI', sans-serif;
}

h1 { text-align: center; margin-bottom: 1.5rem; color: #333; }
h3 { margin-bottom: 0.5rem; color: #555; }

.grid-boxcount {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.grid-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto;
  gap: 1rem;
  margin-bottom: 2rem;
}

.chart-section, .status-box, .score-box {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}

.status-box p { font-weight: bold; margin-bottom: 0.5rem; }

.status-count {
  padding: 0.5rem;
  margin-bottom: 0.3rem;
  border-radius: 4px;
  color: #fff;
}

.status-count.on-process { background-color: #f0ad4e; }
.status-count.finished { background-color: #5cb85c; }

.score-bar {
  height: 20px;
  margin: 0.3rem 0;
  border-radius: 5px;
  color: #fff;
  text-align: right;
  padding-right: 0.5rem;
}

.score-bar.very-good { background-color: #337ab7; }
.score-bar.good { background-color: #5cb85c; }
.score-bar.improve { background-color: #f0ad4e; }

.bar-chart-section {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}
</style>