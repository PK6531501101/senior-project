<template>
  <div class="position-wrapper">
    <div class="container">
      <h1 class="form-title">สร้างแบบประเมินใหม่</h1>
      <p class="division-info"><strong>Division:</strong> {{ divisionName }}</p>

      <div class="card">
        <label for="evaluationTitle" class="input-label">ชื่อแบบประเมิน</label>
        <input id="evaluationTitle" v-model="form.title" placeholder="เช่น: แบบประเมินความพึงพอใจโครงการ..." class="input-field main-title" />
      </div>

      <div v-for="(q, index) in form.questions" :key="index" class="question-card">
        <div class="question-header">
          <span class="question-index">คำถามที่ {{ index + 1 }}</span>
          <button @click="removeQuestion(index)" class="button-remove-question">
            <span class="material-icons">delete</span>
          </button>
        </div>

        <div class="question-content">
          <input v-model="q.questionText" placeholder="ตั้งคำถามของคุณ" class="input-field question-text" />
          <select v-model="q.questionType" class="select-field">
            <option value="short-answer">Short Answer (คำตอบสั้น)</option>
            <option value="paragraph">Paragraph (คำตอบยาว)</option>
            <option value="multiple-choice">Multiple Choice (ตัวเลือก)</option>
            <option value="checkboxes">Checkboxes (หลายตัวเลือก)</option>
            <option value="dropdown">Dropdown (เลือกจากรายการ)</option>
            <option value="linear-scale">Linear Scale (ระดับเชิงเส้น)</option>
            <option value="rating">Rating (ให้คะแนน)</option>
          </select>

          <div v-if="['short-answer', 'paragraph'].includes(q.questionType)" class="question-option-block">
            <label class="option-label">จำนวนคำสูงสุด: 
              <input type="number" min="1" v-model.number="q.maxWords" placeholder="เช่น 20" class="input-field-small" />
            </label>
          </div>

          <div v-if="['multiple-choice', 'checkboxes', 'dropdown'].includes(q.questionType)" class="question-option-block">
            <p class="option-title">ตัวเลือก:</p>
            <div v-for="(opt, i) in q.options" :key="i" class="option-item">
              <input v-model="q.options[i]" placeholder="ตัวเลือก" class="input-field-option" />
              <button @click="removeOption(index, i)" class="button-remove-option">
                <span class="material-icons">close</span>
              </button>
            </div>
            <button @click="addOption(index)" class="button-add-option">เพิ่มตัวเลือก</button>
          </div>

          <div v-if="q.questionType === 'linear-scale'" class="question-option-block">
            <label class="option-label">จาก: <input type="number" v-model.number="q.scaleMin" min="1" class="input-field-small" /></label>
            <label class="option-label">ถึง: <input type="number" v-model.number="q.scaleMax" :min="q.scaleMin" class="input-field-small" /></label>
          </div>

          <div v-if="q.questionType === 'rating'" class="question-option-block">
            <label class="option-label">คะแนนสูงสุด: 
              <input type="number" min="1" v-model.number="q.maxRating" placeholder="เช่น 5" class="input-field-small" />
            </label>
          </div>
        </div>
        
        <div class="question-footer">
          <label class="required-label">
            <input type="checkbox" v-model="q.required" /> Required
          </label>
        </div>
      </div>

      <div class="actions">
        <button @click="addQuestion" class="button-add-question">เพิ่มคำถาม</button>
        <button @click="showSaveConfirm" class="button-save">บันทึก</button>
        <button @click="showCancelConfirm" class="button-cancel">ยกเลิก</button>
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
import Popup from '@/Views/Component/Alert/Alert.vue';

const router = useRouter();
const form = ref({
    title: '',
    degreeLevel: 'Master',
    division: '',
    questions: []
});

const divisionName = ref('');

const showPopup = ref(false);
const popupType = ref('');
const popupMessage = ref('');
const showConfirmPopup = ref(false);
const confirmAction = ref('');
const confirmMessage = ref('');

const fetchAdminDivision = () => {
    form.value.division = localStorage.getItem('division') || 'General Public';
    divisionName.value = form.value.division;
};

onMounted(fetchAdminDivision);

const addQuestion = () => form.value.questions.push({
    questionText: '',
    questionType: 'short-answer',
    options: [],
    required: false,
    maxWords: null,
    scaleMin: 1,
    scaleMax: 5,
    maxRating: 5
});

const removeQuestion = i => form.value.questions.splice(i, 1);
const addOption = qIndex => form.value.questions[qIndex].options.push('');
const removeOption = (qIndex, optIndex) => form.value.questions[qIndex].options.splice(optIndex, 1);

const mapQuestionType = type => {
    switch (type) {
        case 'short-answer': return 'text';
        case 'paragraph': return 'text';
        case 'multiple-choice': return 'multiple-choice';
        case 'checkboxes': return 'checkbox';
        case 'dropdown': return 'dropdown';
        case 'linear-scale': return 'linear-scale';
        case 'rating': return 'rating';
        default: return 'text';
    }
};

function showSuccess(message) {
  popupMessage.value = message;
  popupType.value = 'success';
  showPopup.value = true;
}

function showError(message) {
  popupMessage.value = message;
  popupType.value = 'fail';
  showPopup.value = true;
}

function showConfirm(message, action) {
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmPopup.value = true;
}

function showSaveConfirm() {
  showConfirm('คุณต้องการบันทึกแบบประเมินนี้ใช่หรือไม่?', 'save');
}

function showCancelConfirm() {
  showConfirm('คุณแน่ใจหรือไม่ที่จะยกเลิก? ข้อมูลที่แก้ไขจะถูกลบ', 'cancel');
}

async function handleConfirm() {
  if (confirmAction.value === 'save') {
    await saveEvaluation();
  } else if (confirmAction.value === 'cancel') {
    cancel();
  }
}

async function saveEvaluation() {
    showConfirmPopup.value = false;

    if (!form.value.title.trim()) {
        showError('กรุณากรอกชื่อแบบประเมิน');
        return;
    }

    try {
        const payload = {
            title: form.value.title,
            degreeLevel: form.value.degreeLevel,
            division: form.value.division,
            questions: form.value.questions
                .filter(q => q.questionText.trim() !== '')
                .map(q => ({
                    questionText: q.questionText,
                    questionType: mapQuestionType(q.questionType),
                    options: q.options || [],
                    required: q.required || false,
                    maxWords: q.maxWords || null,
                    scaleMin: q.scaleMin || null,
                    scaleMax: q.scaleMax || null,
                    maxRating: q.maxRating || null
                }))
        };

        const token = localStorage.getItem('token');
        if (!token) {
            showError('คุณยังไม่ได้ล็อกอิน');
            return;
        }

        await axios.post('http://localhost:3000/evaluation', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        showSuccess('สร้างแบบประเมินสำเร็จ');
        // ตั้งเวลาให้กลับไปหน้าอื่นหลังจาก 2.5 วินาที
        setTimeout(() => {
          router.push('/evaluation-list');
        }, 2500);

    } catch (err) {
        console.error(err);
        showError('สร้างแบบประเมินล้มเหลว');
    }
}

const cancel = () => {
  showConfirmPopup.value = false;
  router.push('/evaluation-list');
};
</script>

<style scoped>
/* Container และ Layout */
.container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f0f2f5;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.form-title {
  text-align: center;
  color: #2c3e50;
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.division-info {
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

/* Card และ Input ทั่วไป */
.card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
  transition: box-shadow 0.3s;
}

.card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
}

.input-label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input-field:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.input-field.main-title {
  font-weight: bold;
}

/* Question Cards */
.question-card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
  border-left: 5px solid #007bff;
  transition: border-left-color 0.3s;
}

.question-card:hover {
  border-left-color: #0056b3;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.question-index {
  font-size: 1.2rem;
  font-weight: 600;
  color: #555;
}

.button-remove-question {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  transition: color 0.3s;
}

.button-remove-question:hover {
  color: #dc3545;
}

.question-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-text {
  font-size: 1.1rem;
  font-weight: 500;
}

.select-field {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f8f9fa;
  box-sizing: border-box;
}

.question-option-block {
  background-color: #f8f9fa;
  border-left: 3px solid #007bff;
  padding: 1rem;
  border-radius: 8px;
  margin-top: -0.5rem;
}

.option-title {
  font-weight: 600;
  color: #555;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.input-field-option {
  flex-grow: 1;
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.input-field-small {
  width: 80px;
  padding: 0.6rem;
  text-align: center;
}

.button-remove-option {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
}

.button-add-option {
  background-color: #f0f0f0;
  color: #555;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.button-add-option:hover {
  background-color: #e0e0e0;
}

.question-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  margin-top: 1rem;
}

.required-label {
  color: #555;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.required-label input {
  transform: scale(1.2);
}

/* Action Buttons */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.button-add-question {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button-add-question:hover {
  background-color: #138496;
}

.button-save {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button-save:hover {
  background-color: #218838;
}

.button-cancel {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button-cancel:hover {
  background-color: #c82333;
}
/* Pop-up Styles */
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

/* Animations */
@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-1px); }
  40%, 80% { transform: translateX(1px); }
}
</style>