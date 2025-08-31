<template>
  <div class="position-wrapper">
    <div class="content">
      <h1>Evaluation</h1>

      <form @submit.prevent="goToForm">
        <!-- Division Card -->
        <div class="card">
          <div class="form-section">
            <h4>Division*</h4>
            <select v-model="selectedDivision" required>
              <option disabled value="">Select Division</option>
              <option v-for="d in divisions" :key="d._id" :value="d.name">{{ d.name }}</option>
            </select>
          </div>

          <hr>

          <!-- Evaluation -->
          <div class="form-section">
            <h4>Evaluation</h4>
            <select v-model="selectedEvaluationId" required>
              <option disabled value="">Select Evaluation</option>
              <option v-for="e in evaluations" :key="e._id" :value="e._id">{{ e.title }}</option>
            </select>
          </div>
        </div>

        <!-- Action -->
        <div class="form-section action-card">
          <button type="submit" :disabled="!canProceed" class="agree">Next</button>
          <span v-if="loading" class="status">Loading...</span>
        </div>
      </form>
    </div>

    <Popup :show="showPopup" :popupType="popupType" :message="message" @close="showPopup = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Popup from "@/Views/Component/Alert/Alert.vue";

const API_BASE = 'http://localhost:3000'
const router = useRouter()

const divisions = ref([])
const evaluations = ref([])
const selectedDivision = ref('')
const selectedEvaluationId = ref('')
const loading = ref(false)
const token = localStorage.getItem('token') || ''

const showPopup = ref(false)
const popupType = ref('')
const message = ref('')

function showError(msg) { message.value = msg; popupType.value = 'fail'; showPopup.value = true; }
function showSuccess(msg) { message.value = msg; popupType.value = 'success'; showPopup.value = true; }

if (!token) router.push({ name: 'Login' })

onMounted(() => loadDivisions())

watch(selectedDivision, async (newVal) => {
  if (!newVal) {
    evaluations.value = []
    selectedEvaluationId.value = ''
    return
  }
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/evaluations/division/${encodeURIComponent(newVal)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to load evaluations')
    evaluations.value = await res.json()
  } catch (e) {
    showError(e.message)
  } finally {
    loading.value = false
  }
})

async function loadDivisions () {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/divisions/school`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to load divisions')
    divisions.value = await res.json()
  } catch (e) {
    showError(e.message)
  } finally {
    loading.value = false
  }
}

const canProceed = computed(() => selectedDivision.value && selectedEvaluationId.value)

function goToForm () {
  if (!canProceed.value) {
    showError('Please select both Division and Evaluation')
    return
  }
  router.push({
    name: 'FormDetail',
    params: { evaluationId: selectedEvaluationId.value },
    query: { divisionId: selectedDivision.value }
  })
}
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

form {
  width: 100%;
  max-width: 50rem;
}

.card {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  width: calc(100% - 80px);
  max-width: 50rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

select {
  width: 100%;
  padding: 6px;
  margin-top: 4px;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.action-card {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.status {
  margin-left: 10px;
}
</style>
