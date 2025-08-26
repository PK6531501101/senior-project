<template>
  <div class="position-wrapper">
    <div class="content">
      <h1>{{ evaluation.title }}</h1>
      <h2>{{ currentDate }}</h2>

      <form @submit.prevent="submitEvaluation">
        <div class="card">
          <div v-for="(q, index) in evaluation.questions" :key="q._id" class="form-section">
            <strong>
              <label class="question block font-semibold mb-1">
                {{ index + 1 }}. {{ q.questionText }}
              </label>
            </strong>

            <!-- Text -->
            <input v-if="q.questionType === 'text'" v-model="answers[q._id]" type="text" class="input-field" />

            <!-- Paragraph -->
            <textarea v-else-if="q.questionType === 'paragraph'" v-model="answers[q._id]" rows="4"
              class="input-field"></textarea>

            <!-- Multiple Choice -->
            <div v-else-if="q.questionType === 'multiple-choice'" class="choice-group">
              <label v-for="opt in q.options" :key="opt" class="choice-item">
                <input type="radio" :value="opt" v-model="answers[q._id]" class="big-input" />
                {{ opt }}
              </label>
            </div>

            <!-- Checkbox -->
            <div v-else-if="q.questionType === 'checkbox'" class="choice-group">
              <label v-for="opt in q.options" :key="opt" class="choice-item">
                <input type="checkbox" :value="opt" @change="toggleCheckbox(q._id, opt)"
                  :checked="answers[q._id].includes(opt)" class="big-input" />
                {{ opt }}
              </label>
            </div>

            <!-- Dropdown -->
            <select v-else-if="q.questionType === 'dropdown'" v-model="answers[q._id]" class="input-field">
              <option disabled value="">-- เลือก --</option>
              <option v-for="opt in q.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <!-- Rating -->
            <div v-else-if="q.questionType === 'rating'" class="rating-container">
              <span v-for="n in (q.maxRating || 5)" :key="n" class="star" :class="{ filled: n <= answers[q._id] }"
                @click="answers[q._id] = n">
                ★
              </span>
            </div>

            <!-- Linear Scale -->
            <div v-else-if="q.questionType === 'linear-scale'">
              <label>
                เลือกระดับ:
                <input type="number" :min="q.scaleMin || 1" :max="q.scaleMax || 5" v-model.number="answers[q._id]"
                  class="input-field" />
              </label>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <div class="form-section">
          <button type="submit" class="agree">Submit</button>
          <span v-if="loading" class="status">Submitting...</span>
        </div>
      </form>
    </div>

    <!-- Popup -->
    <Popup
      :show="showPopup"
      :popupType="popupType"
      :message="popupMessage"
      @close="showPopup = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Popup from "@/Views/Component/Alert/Alert.vue";

const API_BASE = 'http://localhost:3000'
const route = useRoute()
const router = useRouter()

const evaluation = ref({ title: '', questions: [] })
const answers = ref({})
const loading = ref(false)

const token = ref(localStorage.getItem('token') || '')
if (!token.value) router.push({ name: 'Login' })

const currentDate = computed(() => {
  const today = new Date()
  const day = today.getDate()
  const month = today.toLocaleString('en-EN', { month: 'long' })
  const year = today.getFullYear() + 543
  return `${day} ${month} ${year}`
})

// Popup state
const showPopup = ref(false)
const popupType = ref('') // 'success' or 'fail'
const popupMessage = ref('')

function showError(msg) {
  popupMessage.value = msg
  popupType.value = 'fail'
  showPopup.value = true
}

function showSuccess(msg) {
  popupMessage.value = msg
  popupType.value = 'success'
  showPopup.value = true
}

onMounted(async () => {
  const evaluationId = route.params.evaluationId
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/evaluation/${evaluationId}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    if (!res.ok) throw new Error('Unable to load evaluation')
    const data = await res.json()
    evaluation.value = data

    data.questions.forEach(q => {
      if (q.questionType === 'checkbox') answers.value[q._id] = []
      else answers.value[q._id] = ''
    })
  } catch (e) {
    showError(e.message)
  } finally {
    loading.value = false
  }
})

function toggleCheckbox(questionId, option) {
  const arr = answers.value[questionId]
  const idx = arr.indexOf(option)
  if (idx > -1) arr.splice(idx, 1)
  else arr.push(option)
}

async function submitEvaluation() {
  loading.value = true
  try {
    const payload = {
      answers: Object.entries(answers.value).map(([questionId, answer]) => ({ questionId, answer }))
    }
    const res = await fetch(`${API_BASE}/evaluation/${evaluation.value._id}/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error || 'Submit failed')
    }
    showSuccess('Evaluation submitted successfully')
  } catch (e) {
    showError(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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

.form-wrapper {
  width: 100%;
  max-width: 600px;
}

.form-section {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  padding: 6px;
  margin-top: 4px;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}


.status {
  margin-left: 10px;
}

.status.success {
  color: #4CAF50;
}

.status.error {
  color: red;
}

form {
  width: 100%;
  max-width: 50rem;
}

.rating-container {
  display: flex;
  gap: 8px;
  font-size: 2rem;
  cursor: pointer;
  padding: 0 1rem;
}

.star {
  color: #ccc;
  /* สีเทาสำหรับดาวที่ไม่ได้เลือก */
  transition: color 0.2s;
}

.star.filled {
  color: gold;
  /* สีทองสำหรับดาวที่เลือก */
}

.choice-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 1rem;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
}

.big-input {
  width: 14px;
  height: 14px;
  transform: scale(1.2);
  /* ขยายปุ่มเลือก */
}

.question {
  font-size: 18px;
}
</style>
