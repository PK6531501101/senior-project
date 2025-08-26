<template>
  <div class="position-wrapper">
    <h1>📊 Staff Dashboard</h1>

    <!-- Box Count -->
    <div class="grid-boxcount" v-if="data.boxCount">
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
        <p>My Evaluation</p>
        <h2>{{ data.boxCount?.evaluation ?? 0 }}</h2>
      </div>
      <div class="card evaluation">
        <p>Evaluation submissions</p>
        <h2>{{ data.boxCount?.evaluationResponses ?? 0 }}</h2>
      </div>
    </div>

    <!-- Status -->
    <div class="grid-status" v-if="data.statusBox">
      <div class="status-box on-process">
        <p>On Process</p>
        <div class="status-count">{{ data.statusBox?.onProcess ?? 0 }}</div>
      </div>
      <div class="status-box finished">
        <p>Finished</p>
        <div class="status-count">{{ data.statusBox?.finished ?? 0 }}</div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid-charts">
      <div class="chart-section">
        <h3>Daily Cases</h3>
        <canvas id="lineChart"></canvas>
      </div>
      <div class="chart-section">
        <h3>Case Type Ratio</h3>
        <canvas id="pieChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const data = ref({});
let lineChartInstance = null;
let pieChartInstance = null;

onMounted(async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:3000/dashboard/staff", {
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
        { label: "Suggestion", data: suggestionData, borderColor: "#7189a8", backgroundColor: "#7189a8", fill: false, tension: 0.4, pointRadius: 5, pointBackgroundColor: "white" },
        { label: "Complaint", data: complaintData, borderColor: "#5e9b53", backgroundColor: "#5e9b53", fill: false, tension: 0.4, pointRadius: 5, pointBackgroundColor: "white" },
        { label: "Corruption", data: corruptionData, borderColor: "#d19a4e", backgroundColor: "#d19a4e", fill: false, tension: 0.4, pointRadius: 5, pointBackgroundColor: "white" },
        { label: "Evaluation", data: evaluationData, borderColor: "#a46450", backgroundColor: "#a46450", fill: false, tension: 0.4, pointRadius: 5, pointBackgroundColor: "white" }
      ]
    },
    options: { 
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Amount' }, grid: { color: 'rgba(0,0,0,0.1)' } },
        x: { title: { display: true, text: 'Day' }, grid: { color: 'rgba(0,0,0,0.1)' } }
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
}
</script>

<style scoped>
h1 { text-align: center; margin-bottom: 1.5rem; color: #333; }
h3 { margin-bottom: 0.5rem; color: #555; }

/* Grid for Box Count */
.grid-boxcount {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Grid for Status */
.grid-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Card Styles */
.card, .status-box {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}

.card p, .status-box p {
  margin: 0;
  font-weight: bold;
  color: #555;
}

.card h2, .status-box .status-count {
  margin-top: 0.5rem;
  font-size: 2rem;
}

/* Colors for cards */
.card.suggestion { background-color: #d0e7ff; }
.card.complaint { background-color: #ffd0d0; }
.card.corruption { background-color: #d0ffd0; }
.card.evaluation { background-color: #ffe0b0; }

.status-box.on-process { background-color: #fff4c0; }
.status-box.finished { background-color: #c0ffc0; }

/* Grid for charts */
.grid-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.chart-section {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}
</style>
