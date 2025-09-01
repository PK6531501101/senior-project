<template>
  <div class="position-wrapper">
    <div class="content">
      <h1>Suggestion Details</h1>
      <div v-if="loading">Loading...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="suggestion" class="card">
        <p><strong>Title:</strong> {{ suggestion.title }}</p>
        <p><strong>Type:</strong> {{ suggestion.type }}</p>
        <p><strong>Division:</strong> {{ suggestion.division }}</p>
        <p><strong>Name:</strong> {{ suggestion.name || 'Anonymous' }}</p>
        <p><strong>Email:</strong> {{ suggestion.email || '-' }}</p>
        <p><strong>Phone:</strong> {{ suggestion.phone || '-' }}</p>
        <p><strong>Current Status:</strong> {{ suggestion.currentStatus }}</p>
        <p><strong>Details:</strong> {{ suggestion.details }}</p>
        <p><strong>Status:</strong> {{ suggestion.status }}</p>
      </div>

      <!-- ปุ่มด้านนอกการ์ด -->
      <div class="card-buttons">
        <button v-if="suggestion.status !== 'Accept'" @click="acceptSuggestion" class="agree">Accept</button>
        <button class="disagree" @click="$router.back()">Back</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      suggestion: null,
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
 
    const id = this.$route.params.id;
    try {
      this.loading = true;
      const res = await axios.get(`http://localhost:3000/suggestion/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.suggestion = res.data;
    } catch (err) {
      this.error = err.response?.data?.error || 'Failed to load suggestion details';
      console.error(err);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async acceptSuggestion() {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.patch(`http://localhost:3000/suggestion/${this.suggestion._id}/status`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.suggestion.status = res.data.suggestion.status;
        alert('Status updated to Accept');
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to update status');
        console.error(err);
      }
    }
  }
};
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px 30px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 40rem;
  margin: 20px 0;
}

.card-buttons {
  display: flex;
  justify-content: center; /* จัดกึ่งกลาง */
  gap: 12px; /* ระยะห่างระหว่างปุ่ม */
  margin-bottom: 2rem; /* เพิ่มระยะห่างด้านล่าง */
}

.error {
  color: red;
}

</style>
