<template>
  <div class="position-wrapper">
    <div class="content">
      <h1>Complaints List</h1>
      <h3>Topic of {{ division }}</h3>

      <div v-if="loading" class="status">Loading complaints...</div>
      <div v-if="error" class="status error">{{ error }}</div>

      <div v-if="!loading && complaints.length" class="complaint-cards">
        <div
          v-for="c in complaints"
          :key="c._id"
          class="complaint-card"
          @click="viewComplaint(c._id)"
        >
          <div class="card-top">
            <div class="title-type">
              <h2 class="title">{{ c.title }}</h2>
            </div>
            <span class="status" :class="statusColor(c.status)">{{ c.status }}</span>
          </div>
          <div class="card-bottom">
            <span class="date">{{ formatDate(c.date) }}</span>
          </div>
        </div>
      </div>

      <p v-else-if="!loading">No complaints found for your division.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      complaints: [],
      division: '',
      loading: false,
      error: ''
    };
  },
  async created() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/login');
      return;
    }

    try {
      this.loading = true;

      // ดึงข้อมูล division ของผู้ใช้
      const profileRes = await axios.get('http://localhost:3000/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.division = profileRes.data.division;

      // ดึง complaints ของ division
      const res = await axios.get('http://localhost:3000/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.complaints = res.data;
    } catch (err) {
      console.error(err);
      this.error = err.response?.data?.error || 'Failed to load complaints';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async viewComplaint(id) {
      const token = localStorage.getItem('token');
      try {
        const index = this.complaints.findIndex(c => c._id === id);
        if (index !== -1 && this.complaints[index].status === 'Not read yet') {
          await axios.patch(`http://localhost:3000/complaint/${id}/view`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.complaints[index].status = 'On Process';
        }

        this.$router.push(`/complaint-detail-admin/${id}`);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || 'Failed to update complaint status');
      }
    },
    statusColor(status) {
      if (status === 'On Process') return 'status-yellow';
      if (status === 'Forward' || 'Accept') return 'status-blue';
      if (status === 'Finished') return 'status-green';
      return 'status-red';
    },
    formatDate(dateStr) {
      const d = new Date(dateStr);
      const day = d.getDate();
      const month = d.toLocaleString('en-EN', { month: 'long' });
      const year = d.getFullYear() + 543;
      return `${day} ${month} ${year}`;
    }
  }
};
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
  font-weight: bold;
}

.status.error {
  color: red;
}

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

.status-yellow { color: orange; }
.status-green { color: green; }
.status-blue { color: blue; }
.status-red { color: red; }

.card-bottom {
  font-size: 0.85rem;
  color: #555;
  text-align: left;
  margin-bottom: 14px;
}
</style>
