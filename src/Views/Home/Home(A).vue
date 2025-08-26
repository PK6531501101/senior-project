<template>
  <div class="position-wrapper">
    <div class="content">
      <h1>TO INFORMATION</h1>
      <h4>CHOOSE A TOPIC</h4>

      <div class="card-container">
        <!-- Suggestion -->
        <div class="card" @click="$router.push('/suggestion-list')">
          <img src="@/Assets/Image/Sugg.png" alt="Suggestion" class="card-icon" />
          <span>Suggestion</span>
          <span v-if="counts.suggestion > 0" class="badge">{{ counts.suggestion }}</span>
        </div>

        <!-- Complaint -->
        <div
          class="card"
          :class="{ 'disabled-card': !canAccessComp }"
          @click="canAccessComp && handleComplaintClick()"
        >
          <img src="@/Assets/Image/Comp.png" alt="Complaint" class="card-icon" />
          <span>Complaint</span>
          <span v-if="counts.complaint > 0" class="badge">{{ counts.complaint }}</span>
        </div>

        <!-- Corruption -->
        <div
          class="card"
          :class="{ 'disabled-card': !canAccessCorr }"
          @click="canAccessCorr && handleCorruptionClick()"
        >
          <img src="@/Assets/Image/Corr.png" alt="Corruption" class="card-icon" />
          <span>Corruption</span>
          <span v-if="counts.corruption > 0" class="badge">{{ counts.corruption }}</span>
        </div>

        <!-- Evaluation -->
        <div class="card" @click="$router.push('/evaluation-list')">
          <img src="@/Assets/Image/Eval.png" alt="Evaluation" class="card-icon" />
          <span>Evaluation</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const API_BASE = "http://localhost:3000";

export default {
  data() {
    return {
      name: localStorage.getItem("name") || "",
      role: Number(localStorage.getItem("role")) || 0,
      division: localStorage.getItem("division") || "",
      counts: {
        suggestion: 0,
        complaint: 0,
        corruption: 0,
      },
    };
  },
  computed: {
    canAccessComp() {
      return (
        this.role === 3 ||
        this.division === "Correspondence, Document, and Legal Affairs Division" ||
        this.role === 2
      );
    },
    canAccessCorr() {
      return (
        this.role === 3 ||
        this.division === "Correspondence, Document, and Legal Affairs Division"
      );
    },
  },
  mounted() {
    this.fetchCounts();
  },
  methods: {
    async fetchCounts() {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(`${API_BASE}/unread-counts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("ไม่สามารถโหลดจำนวนสถานะได้");
        const data = await res.json();
        // คาดว่า API จะส่ง { suggestion: 2, complaint: 5, corruption: 3 }
        this.counts = data;
      } catch (e) {
        console.error(e.message);
      }
    },
    handleComplaintClick() {
      if (
        this.role === 3 ||
        this.division === "Correspondence, Document, and Legal Affairs Division"
      ) {
        this.$router.push("/complaint-list-admin");
      } else if (this.role === 2) {
        this.$router.push("/complaint-list");
      }
    },
    handleCorruptionClick() {
      if (this.canAccessCorr) {
        this.$router.push("/corruption-list");
      }
    },
  },
};
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 50px;
  margin: 3rem 0;
}

.card {
  width: 220px;
  height: 250px;
  background: white;
  border-radius: 8px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.5s, background 0.5s;
  gap: 8px;
  position: relative; /* เพื่อวาง badge */
}

.card:hover {
  transform: scale(1.05);
  background: gray;
  color: white;
}

.card img.card-icon {
  width: 70px;
  height: auto;
  transition: filter 0.05s;
}

.card:hover img.card-icon {
  filter: brightness(0) invert(1);
}

.disabled-card {
  opacity: 0.4;
  cursor: not-allowed;
}

.badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: red;
  color: white;
  font-weight: bold;
  border-radius: 50%;
  padding: 6px 11px;
  font-size: 0.9rem;
}
</style>
