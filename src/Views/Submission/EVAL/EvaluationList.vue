<template>
  <div class="position-wrapper">
    <div class="container">
      <h1>แบบประเมินของฉัน (Admin)</h1>

      <button @click="goToCreate" class="agree">สร้างแบบประเมินใหม่</button>

      <div v-if="loading" class="loading-message">กำลังโหลดแบบประเมิน...</div>

      
      <div v-else>
        <div v-if="evaluations.length === 0" class="empty-state">
          <p>ยังไม่มีแบบประเมิน</p>
        </div>

        <div v-else class="card-list">
          <div v-for="evalItem in evaluations" :key="evalItem._id" class="card"
            :class="{ 'is-editing': editingId === evalItem._id }"
            @click="editingId !== evalItem._id && startEditing(evalItem)">

            <div v-if="editingId !== evalItem._id" class="card-display">
              <div class="card-info">
                <h3 class="card-title">{{ evalItem.title }}</h3>
                <span class="card-date">
                  {{ formatDate(evalItem.updatedAt && evalItem.updatedAt !== evalItem.createdAt ? evalItem.updatedAt :
                  evalItem.createdAt) }}
                  ({{ evalItem.updatedAt && evalItem.updatedAt !== evalItem.createdAt ? 'Updated' : 'Created' }})
                </span>
              </div>
              <div class="card-meta">
                <span class="responses">จำนวนผู้ตอบ: {{ evalItem.responses?.length || 0 }}</span>
              </div>
            </div>

            <div v-else class="card-editing">
              <input v-model="editForm.title" placeholder="ชื่อแบบประเมิน" class="input-field" />

              <input v-model="editForm.division" placeholder="Division" disabled class="input-field disabled" />

              <div v-for="(q, index) in editForm.questions" :key="index" class="question-block">
                <input v-model="q.questionText" placeholder="ข้อคำถาม" class="input-field" />
                <select v-model="q.questionType" class="input-field">
                  <option value="text">Short Answer</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="rating">Rating</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="linear-scale">Linear Scale</option>
                </select>

                <div v-if="['multiple-choice', 'checkbox', 'dropdown'].includes(q.questionType)"
                  class="options-container">
                  <div v-for="(opt, i) in q.options" :key="i" class="option-item">
                    <input v-model="q.options[i]" placeholder="ตัวเลือก" class="input-field option-input" />
                    <button type="button" @click.stop="removeOption(index, i)" class="button-remove">ลบ</button>
                  </div>
                  <button type="button" @click.stop="addOption(index)" class="button-add-option">เพิ่มตัวเลือก</button>
                </div>

                <div v-if="q.questionType === 'linear-scale'" class="scale-range">
                  <label>จาก: <input type="number" v-model.number="q.scaleMin" min="1"
                      class="input-field short" /></label>
                  <label>ถึง: <input type="number" v-model.number="q.scaleMax" min="q.scaleMin"
                      class="input-field short" /></label>
                </div>

                <div class="question-actions">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="q.required" /> Required
                  </label>
                  <button type="button" @click.stop="removeQuestion(index)"
                    class="button-delete-question">ลบคำถาม</button>
                </div>
              </div>

              <div class="editing-buttons">
                <button @click.stop="addQuestion" class="button-add-question">เพิ่มคำถาม</button>
                <button @click.stop="saveEvaluation" class="button-save">บันทึก</button>
                <button @click.stop="cancelEditing" class="button-cancel">ยกเลิก</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Popup :show="showPopup" :popupType="popupType" :message="popupMessage" @close="showPopup = false" />

  <div v-if="showConfirmPopup" class="popup-overlay">
    <div class="popup-card">
      <img src="@/Assets/Image/Warning.png" alt="warning" class="popup-img" />
      <h1>Warning</h1>
      <p>{{ confirmMessage }}</p>
      <div class="button-row">
        <button class="agree" @click="handleConfirm">YES</button>
        <button class="agree" @click="showConfirmPopup = false">NO</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
// Import component Popup จากโค้ดเดิม
import Popup from '@/Views/Component/Alert/Alert.vue';

const router = useRouter();
const evaluations = ref([]);
const loading = ref(true);

const editingId = ref(null);
const editForm = ref({
  title: '',
  degreeLevel: 'Bachelor',
  division: '',
  questions: []
});

// เพิ่ม state สำหรับจัดการ pop-up
const showPopup = ref(false);
const popupType = ref('');
const popupMessage = ref('');
const showConfirmPopup = ref(false);
const confirmAction = ref('');
const confirmMessage = ref('');
// เพิ่มตัวแปรสำหรับเก็บ index ของคำถามที่จะลบ
const questionIndexToDelete = ref(null);

// ฟังก์ชันสำหรับแสดง pop-up
const showSuccess = (message) => {
  popupMessage.value = message;
  popupType.value = 'success';
  showPopup.value = true;
};

const showError = (message) => {
  popupMessage.value = message;
  popupType.value = 'fail';
  showPopup.value = true;
};

// ฟังก์ชันสำหรับแสดง Confirm pop-up
const showConfirm = (message, action, index) => { // เพิ่ม 'index' เป็น parameter
  confirmMessage.value = message;
  confirmAction.value = action;
  questionIndexToDelete.value = index; // เก็บ index ของคำถาม
  showConfirmPopup.value = true;
};

// ฟังก์ชันจัดการเมื่อผู้ใช้กด 'YES' ใน Confirm pop-up
const handleConfirm = () => {
  showConfirmPopup.value = false;
  if (confirmAction.value === 'deleteQuestion') {
    handleRemoveQuestion(questionIndexToDelete.value);
  }
};

const fetchEvaluations = async () => {
  try {
    loading.value = true;
    const division = (localStorage.getItem('division') || '').trim();
    if (!division) {
      showError('ไม่พบ Division ใน Local Storage');
      return;
    }
    const res = await axios.get(`http://localhost:3000/evaluations/division/${encodeURIComponent(division)}`);
    evaluations.value = res.data;
  } catch (err) {
    console.error('Failed to fetch evaluations:', err);
    showError('ไม่สามารถดึงข้อมูลแบบประเมินได้');
    evaluations.value = [];
  } finally {
    loading.value = false;
  }
};

const goToCreate = () => router.push('/create-form');

const startEditing = (evalItem) => {
  editingId.value = evalItem._id;
  editForm.value = {
    title: evalItem.title,
    degreeLevel: evalItem.degreeLevel,
    division: evalItem.division || '',
    questions: evalItem.questions.map(q => ({
      ...q,
      options: q.options ? [...q.options] : [], // Clone array
    }))
  };
};

const cancelEditing = () => {
  editingId.value = null;
};

const addQuestion = () => {
  editForm.value.questions.push({
    questionText: '',
    questionType: 'text',
    options: [],
    required: false,
    maxWords: null,
    scaleMin: 1,
    scaleMax: 5,
    maxRating: 5
  });
};

const saveEvaluation = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showError('คุณยังไม่ได้ล็อกอิน');
      return;
    }

    await axios.put(
      `http://localhost:3000/evaluation/${editingId.value}`,
      editForm.value,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    showSuccess('บันทึกแบบประเมินสำเร็จ!');
    editingId.value = null;
    fetchEvaluations();
  } catch (err) {
    console.error('Failed to save evaluation:', err.response?.data || err);
    showError('บันทึกแบบประเมินล้มเหลว');
  }
};

const addOption = (qIndex) => {
  editForm.value.questions[qIndex].options.push('');
};

const removeOption = (qIndex, optIndex) => {
  editForm.value.questions[qIndex].options.splice(optIndex, 1);
};

// ฟังก์ชันที่ถูกเรียกเมื่อผู้ใช้คลิกปุ่ม 'ลบคำถาม'
const removeQuestion = (index) => {
  showConfirm('คุณแน่ใจที่จะลบคำถามนี้หรือไม่?', 'deleteQuestion', index);
};

// ฟังก์ชันที่ทำหน้าที่ลบคำถามจริง ๆ หลังจากผู้ใช้กดยืนยัน
const handleRemoveQuestion = (index) => {
  editForm.value.questions.splice(index, 1);
  showSuccess('ลบคำถามเรียบร้อยแล้ว');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.toLocaleString('th-TH', { month: 'long' });
  const year = d.getFullYear() + 543;
  return `${day} ${month} ${year}`;
};

onMounted(fetchEvaluations);
</script>

<style scoped>
/* ส่วนสไตล์เดิม */
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 2rem;
  box-sizing: border-box;
}

h1 {
  color: #333;
  margin-bottom: 1.5rem;
}

.button-create {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 2rem;
}

.button-create:hover {
  background-color: #0056b3;
}

.loading-message,
.empty-state {
  font-size: 1.2rem;
  color: #666;
  text-align: center;
  margin-top: 2rem;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* Card */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  width: 100%; /* card จะเต็ม container */
  max-width: 600px; /* จำกัดความกว้างสูงสุด */
  margin: 0 auto;
}

.card:not(.is-editing):hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.card.is-editing {
  background-color: #f8f9fa;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

/* Display Mode */
.card-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.25rem;
}

.card-date {
  font-size: 0.9rem;
  color: #777;
}

.responses {
  font-size: 1rem;
  font-weight: bold;
  color: #007bff;
}

/* Editing Mode */
.card-editing {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.input-field.disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.question-block {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  background-color: #f1f3f5;
}

.options-container {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.option-input {
  flex-grow: 1;
}

.button-remove {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.button-add-option,
.button-add-question,
.button-save,
.button-cancel,
.button-delete-question {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.button-add-option {
  background-color: #6c757d;
  color: white;
}

.button-add-option:hover {
  background-color: #5a6268;
}

.question-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.button-delete-question {
  background-color: #f8d7da;
  color: #721c24;
}

.button-delete-question:hover {
  background-color: #f5c6cb;
}

.editing-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.button-add-question {
  background-color: #17a2b8;
  color: white;
}

.button-add-question:hover {
  background-color: #138496;
}

.button-save {
  background-color: #28a745;
  color: white;
}

.button-save:hover {
  background-color: #218838;
}

.button-cancel {
  background-color: #dc3545;
  color: white;
}

.button-cancel:hover {
  background-color: #c82333;
}

/* --- Pop-up Styles --- */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.popup-card {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem 1rem;
  width: 280px;
  text-align: center;
  animation: popIn 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.popup-img {
  width: 120px;
  height: 120px;
  margin-bottom: 0.5rem;
  animation: shake 0.3s ease-in-out;
}

.popup-card h1 {
  margin: 0.25rem 0;
}

.popup-card p {
  margin: 0.25rem 0 0.75rem;
  font-size: 0.9rem;
  color: #555;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.agree {
  padding: 10px 25px;
  font-weight: bold;
  font-size: 15px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  border-radius: 16px;
  transition: background-color 0.3s, color 0.3s;
}

h1 {
  text-align: center;
}

/* Animations */
@keyframes popIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  20%,
  60% {
    transform: translateX(-1px);
  }

  40%,
  80% {
    transform: translateX(1px);
  }
}
</style>