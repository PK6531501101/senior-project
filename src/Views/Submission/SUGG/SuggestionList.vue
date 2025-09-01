<template>
  <div class="position-wrapper">
    <div class="content">
      <h1>Suggestions List</h1>
      <h3>Topic of {{ division }}</h3>

      <div v-if="loading" class="status">Loading suggestions...</div>
      <div v-if="error" class="status error">{{ error }}</div>

      <div v-if="!loading && suggestions.length" class="suggestion-cards">
        <div
          v-for="sugg in suggestions"
          :key="sugg._id"
          class="suggestion-card"
          @click="viewSuggestion(sugg._id)"
        >
          <div class="card-top">
            <div class="title-type">
              <h2 class="title">{{ sugg.title }}</h2>
            </div>
            <span class="status" :class="statusColor(sugg.status)">{{ sugg.status }}</span>
          </div>
          <div class="card-bottom">
            <span class="date">{{ formatDate(sugg.date) }}</span>
          </div>
        </div>
      </div>

      <p v-else-if="!loading">No suggestions found for your division.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      suggestions: [],
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

      const profileRes = await axios.get('http://localhost:3000/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.division = profileRes.data.division;

      const res = await axios.get('http://localhost:3000/suggestions/mydivision', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.suggestions = res.data;
    } catch (err) {
      console.error(err);
      this.error = err.response?.data?.error || 'Failed to load suggestions';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async viewSuggestion(id) {
      const token = localStorage.getItem('token');
      try {
        await axios.patch(`http://localhost:3000/suggestion/${id}/view`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const index = this.suggestions.findIndex(s => s._id === id);
        if (index !== -1) this.suggestions[index].status = 'On process';

        this.$router.push(`/suggestion-detail/${id}`);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || 'Failed to update suggestion status');
      }
    },
    statusColor(status) {
      if (status === 'On process') return 'status-yellow';
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
}

.status.error {
  color: red;
}

.suggestion-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  width: 100%;
  max-width: 50rem;
}

.suggestion-card {
  background: white;
  border-radius: 8px;
  padding: 16px 30px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.suggestion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Card top - title + status */
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

.status {
  margin-top: 30px;
  font-weight: bold;
}

.status-red {
  color: red;
}

.status-yellow {
  color: orange;
}

.status-green {
  color: green;
}

/* Card bottom - date */
.card-bottom {
  font-size: 0.85rem;
  color: #555;
  text-align: left;
  margin-bottom: 14px;
}
</style>
