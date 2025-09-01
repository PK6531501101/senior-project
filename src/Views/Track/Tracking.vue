<template>
  <div class="position-wrapper">
    <div class="content">
      <h1>Tracking Reports</h1>
      <h2>{{ currentDate }}</h2>

      <div v-if="loading" class="status">Loading reports...</div>
      <div v-if="error" class="status error">{{ error }}</div>
      <div v-if="!loading && !reports.length" class="status">No reports found.</div>

      <div v-if="!loading && reports.length" class="report-cards">
        <div v-for="report in reports" :key="report._id" class="report-card" @click="viewReport(report)">
          <div class="card-top">
            <div class="title-type">
              <h2 class="title">{{ report.type === 'Complaint' ? report.title : report.reportedName }}</h2>
              <span class="type">( {{ report.type }} )</span>
              <span class="view-badge" :class="{ unread: report.view === 'Not read yet' }"></span>
            </div>
            <span class="status" :class="statusColor(report.status)">{{ report.status }}</span>
          </div>
          <div class="card-bottom">
            <span class="date">{{ formatDate(report.date) }}</span>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div v-if="selectedReport" class="modal-backdrop" @click.self="selectedReport = null">
        <div class="modal-content">
          <h2 class="font-bold text-lg mb-4 text-center">Your Tracking</h2>

          <div class="tracking-container">
            <!-- Send -->
            <div class="step-wrapper">
              <div class="step" :class="{
                'active': selectedReport.status !== 'Not read yet' || selectedReport.status === 'Not read yet',
                'finished': selectedReport.status === 'Finished'
              }">
                <img src="@/Assets/Image/Send.png" alt="Send">
              </div>
              <span class="step-label" :class="{
                'active': selectedReport.status !== 'Not read yet' || selectedReport.status === 'Not read yet',
                'finished': selectedReport.status === 'Finished'
              }">Accept</span>
            </div>

            <!-- Arrow 1 -->
            <div class="arrow" :class="{
              'active': selectedReport.status !== 'Not read yet' || selectedReport.status === 'Finished',
              'finished': selectedReport.status === 'Finished'
            }">
              <img src="@/Assets/Image/Arrow.png" alt="Arrow">
            </div>

            <!-- Process -->
            <div class="step-wrapper">
              <div class="step" :class="{
                'active': selectedReport.status !== 'Not read yet',
                'finished': selectedReport.status === 'Finished'
              }">
                <img src="@/Assets/Image/Process.png" alt="Process">
              </div>
              <span class="step-label" :class="{
                'active': selectedReport.status !== 'Not read yet',
                'finished': selectedReport.status === 'Finished'
              }">On Process</span>
            </div>

            <!-- Arrow 2 -->
            <div class="arrow" :class="{
              'active': selectedReport.status === 'Finished',
              'inactive': selectedReport.status !== 'Finished' && selectedReport.status !== 'Not read yet'
            }">
              <img src="@/Assets/Image/Arrow.png" alt="Arrow">
            </div>

            <!-- Finish -->
            <div class="step-wrapper">
              <div class="step" :class="{
                'active': selectedReport.status === 'Finished',
                'inactive': selectedReport.status !== 'Finished'
              }">
                <img src="@/Assets/Image/Finish.png" alt="Finish">
              </div>
              <span class="step-label" :class="{
                'active': selectedReport.status === 'Finished',
                'inactive': selectedReport.status !== 'Finished'
              }">Finish</span>
            </div>
          </div>

          <div v-if="selectedReport.acceptInfo && selectedReport.acceptInfo.message" class="mt-2 admin-message">
            <p><strong>Message from Admin:</strong></p>
            <p>{{ selectedReport.acceptInfo.message }}</p>
          </div>
          <div v-else class="mt-2 admin-message">
            <p>No admin message yet.</p>
          </div>

          <button class="btn disagree mt-4" @click="selectedReport = null">Close</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const reports = ref([])
const selectedReport = ref(null)
const loading = ref(false)
const error = ref('')

const token = localStorage.getItem('token') || ''
if (!token) window.location.href = '/login'

const currentDate = computed(() => {
  const today = new Date()
  const day = today.getDate()
  const month = today.toLocaleString('en-EN', { month: 'long' })
  const year = today.getFullYear() + 543
  return `${day} ${month} ${year}`
})

const fetchReports = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('http://localhost:3000/myreports', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) {
      const msg = await res.json().catch(() => ({}))
      throw new Error(msg.error || 'Failed to fetch reports')
    }
    reports.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const viewReport = async (report) => {
  selectedReport.value = report

  // อัปเดต view ไป backend
  try {
    const res = await fetch(`http://localhost:3000/report/${report.type}/${report._id}/view`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (!res.ok) throw new Error('Failed to update view')
    // อัปเดตใน frontend
    report.view = 'Read'
  } catch (err) {
    console.error(err)
  }
}

const statusColor = (status) => {
  if (status === 'Not read yet') return 'status-red'
  if (status === 'Finished') return 'status-green'
  return 'status-yellow'
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  const day = d.getDate()
  const month = d.toLocaleString('en-EN', { month: 'long' })
  const year = d.getFullYear() + 543
  return `${day} ${month} ${year}`
}

onMounted(() => fetchReports())
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.status {
  margin-top: 30px;
}

.status.error {
  color: red;
}

.report-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  width: 100%;
  max-width: 50rem;
}

.report-card {
  background: white;
  border-radius: 8px;
  padding: 16px 30px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.title-type {
  display: flex;
  gap: 8px;
  align-items: center;
}

.title {
  font-weight: bold;
  font-size: 1.1rem;
}

.type {
  color: #888;
  font-size: 0.9rem;
}

.status {
  font-weight: bold;
}

.status-red {
  color: red;
}

.status-green {
  color: green;
}

.status-yellow {
  color: orange;
}

.card-bottom {
  font-size: 0.85rem;
  color: #555;
  text-align: left;
  margin-bottom: 14px;
}

.btn {
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
}

.btn.disagree {
  background-color: #ccc;
  color: black;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  max-width: 600px;
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tracking-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 16px 0;
}

.step-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step {
  border: 2px solid #ccc;
  border-radius: 12px;
  padding: 20px 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-label {
  margin-top: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  color: #333;
}

.step.active {
  border-color: green;
}

.step img {
  width: 50px;
  height: auto;
  opacity: 0.3;
}

.step.active img,
.step.finished img {
  opacity: 1;
}

.arrow img {
  width: 24px;
  height: auto;
  opacity: 0.3;
}

.arrow.active img {
  opacity: 1;
}

.admin-message {
  text-align: center;
  margin-top: 12px;
}
</style>
