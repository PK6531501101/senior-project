<template>
  <div class="position-wrapper">
    <div class="content">
      <h1>Complaints List</h1>
      <h3>Topic of {{ division }}</h3>
      <h3>Forwarded from Correspondence, Document, and Legal Affairs Division</h3>

      <div v-if="loading" class="status">Loading complaints...</div>
      <div v-else-if="complaints.length === 0" class="status">No complaints found.</div>

      <div v-else class="complaint-cards">
        <div
          v-for="item in complaints"
          :key="item._id"
          class="complaint-card"
          @click="goToDetail(item._id)"
        >
          <div class="card-top">
            <div class="title-type">
              <h2 class="title">{{ item.title }}</h2>
            </div>
            <span class="status" :class="statusColor(item.status)">{{ item.status }}</span>
          </div>
          <div class="card-bottom">
            <span>Forwarded From: Correspondence, Document, and Legal Affairs Division</span><br />
            <span>Latest Forward Date: {{ formatDate(latestForwardDate(item)) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const complaints = ref([]);
const loading = ref(false);
const token = localStorage.getItem('token') || '';
const division = localStorage.getItem('division') || '';
const router = useRouter();

function isForwardedFromDivision(complaint) {
  if (!complaint.forwardHistory || complaint.forwardHistory.length === 0) return false;
  return complaint.forwardHistory.some(fwd =>
    fwd.toDivision === division &&
    (fwd.fromUserName === "L1" || fwd.fromUserName === "Legal")
  );
}

function latestForwardDate(complaint) {
  const forwards = complaint.forwardHistory.filter(fwd =>
    fwd.toDivision === division &&
    (fwd.fromUserName === "L1" || fwd.fromUserName === "Legal")
  );
  if (!forwards.length) return null;
  return forwards.reduce((latest, fwd) =>
    new Date(fwd.forwardDate) > new Date(latest.forwardDate) ? fwd : latest
  ).forwardDate;
}

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleString();
}

async function goToDetail(id) {
  try {
    if (Number(localStorage.getItem('role')) === 2) {
      await axios.put(`http://localhost:3000/complaints/${id}/mark-on-process`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    router.push(`/complaint-detail/${id}`);
  } catch (error) {
    console.error('Failed to mark complaint as On process:', error);
    alert('Failed to mark complaint as On process');
  }
}

async function fetchComplaints() {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:3000/complaints', {
      headers: { Authorization: `Bearer ${token}` }
    });
    complaints.value = res.data.filter(isForwardedFromDivision);
  } catch (error) {
    alert('Failed to load complaints');
    console.error(error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchComplaints();
});

function statusColor(status) {
  if (status === 'On process') return 'status-yellow';
  if (status === 'Finished') return 'status-green';
  return 'status-red';
}
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.status {
  margin-top: 40px;
  font-weight: bold;
}

.status-red { color: red; }
.status-yellow { color: orange; }
.status-green { color: green; }

.complaint-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  width: 100%;
  max-width: 50rem;
}

.complaint-card {
  background: white;
  border-radius: 8px;
  padding: 16px 30px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.complaint-card:hover {
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
  align-items: center;
  gap: 8px;
}

.title {
  font-weight: bold;
  font-size: 1.1rem;
}

.division {
  font-size: 0.9rem;
  color: #555;
}

.card-bottom {
  font-size: 0.85rem;
  color: #555;
  text-align: left;
  margin-bottom: 14px;
}
</style>
