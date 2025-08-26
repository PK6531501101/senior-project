<template>
  <div class="position-wrapper">
    <div class="content">
      <h1>Corruption List</h1>
      <h3>Topic of {{ division }}</h3>

      <div v-if="loading" class="status">Loading corruption reports...</div>
      <div v-if="error" class="status error">{{ error }}</div>

      <div v-if="!loading && corruptions.length" class="corruption-cards">
        <div
          v-for="c in corruptions"
          :key="c._id"
          class="corruption-card"
          @click="viewCorruption(c._id)"
        >
          <div class="card-top">
            <div class="title-type">
              <h2 class="reported-name">{{ c.reportedName }}</h2>
            </div>
            <span class="status" :class="statusColor(c.status)">{{ c.status }}</span>
          </div>
          <div class="card-bottom">
            <span class="date">{{ formatDate(c.dateSubmitted) }}</span>
          </div>
        </div>
      </div>

      <p v-else-if="!loading">No corruption reports found for your division.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      corruptions: [],
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

      // ดึง corruption reports ของ division
      const res = await axios.get('http://localhost:3000/corruptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.corruptions = res.data;
    } catch (err) {
      console.error(err);
      this.error = err.response?.data?.error || 'Failed to load corruption reports';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async viewCorruption(id) {
      const token = localStorage.getItem('token');
      try {
        const index = this.corruptions.findIndex(c => c._id === id);
        if (index !== -1 && this.corruptions[index].status === 'Not read yet') {
          await axios.patch(`http://localhost:3000/corruption/${id}/view`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.corruptions[index].status = 'On Process';
        }

        this.$router.push(`/corruption-detail/${id}`);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || 'Failed to update corruption status');
      }
    },
    statusColor(status) {
      if (status === 'On Process') return 'status-yellow';
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
  margin-top: 20px;
  font-weight: bold;
}

.status.error {
  color: red;
}

.corruption-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  width: 100%;
  max-width: 50rem;
}

.corruption-card {
  background: white;
  border-radius: 8px;
  padding: 16px 30px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.corruption-card:hover {
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

.reported-name {
  font-weight: bold;
  font-size: 1.1rem;
}

.division {
  font-size: 0.9rem;
  color: #555;
}

.status-yellow { color: orange; }
.status-green { color: green; }
.status-red { color: red; }

.card-bottom {
  font-size: 0.85rem;
  color: #555;
  text-align: left;
  margin-bottom: 14px;
}
</style>
