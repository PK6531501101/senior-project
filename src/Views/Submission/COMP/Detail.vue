<template>
  <div class="position-wrapper">
    <div class="content">
      <h1>Complaint Details</h1>

      <div v-if="loading">Loading...</div>
      <div v-else-if="complaint" class="card">
        <p><strong>Title : </strong> {{ complaint.title }}</p>
        <p><strong>Name : </strong> {{ complaint.name }}</p>
        <p><strong>Email : </strong> {{ complaint.email || '-' }}</p>
        <p><strong>Phone : </strong> {{ complaint.phone || '-' }}</p>
        <p><strong>Current Status : </strong> {{ complaint.currentStatus }}</p>
        <p><strong>Details : </strong> {{ complaint.details }}</p>

        <p>
          <strong>File : </strong>
          <a v-if="complaint.file" :href="`http://localhost:3000/uploads/complaints/${complaint.file}`" target="_blank">
            View File
          </a>
          <span v-else>No file</span>
        </p>

        <div v-if="complaint.acceptInfo && complaint.acceptInfo.acceptedDate" class="accept-info">
          <h3>Accept Info</h3>
          <p>Predict: {{ complaint.acceptInfo.predict }}</p>
          <p>Message: {{ complaint.acceptInfo.message }}</p>
          <p>Accepted Date: {{ formatDate(complaint.acceptInfo.acceptedDate) }}</p>
        </div>
      </div>

      <!-- ปุ่มด้านนอกการ์ด -->
      <div class="card-buttons" v-if="complaint">
        <button v-if="!complaint.acceptInfo || !complaint.acceptInfo.acceptedDate" @click="showAcceptModal = true"
          class="agree">
          Accept
        </button>

        <button v-if="complaint.acceptInfo && complaint.acceptInfo.acceptedDate && !hasReplyFile"
          @click="$refs.replyInput.click()" class="agree" :disabled="complaint.status === 'Finished'">
          Upload Reply File
        </button>

        <button v-if="hasReplyFile" @click="showConfirm('Are you sure to finish this complaint?', 'finishComplaint')" :disabled="complaint.status === 'Finished'" class="agree">
          Submit & Finish
        </button>

        <button class="disagree" @click="$router.back()">Back</button>

        <input type="file" ref="replyInput" style="display:none" @change="handleReplyFileChange" />
      </div>

      <!-- Accept Modal -->
      <div v-if="showAcceptModal" class="modal">
        <div class="modal-content">
          <h3>Accept Complaint</h3>
          <p><strong>Forwarded From:</strong> {{ lastForward.fromUserName || 'Unknown' }}</p>

          <label>Predict:</label>
          <select v-model="acceptForm.predict" required>
            <option value="">-- Select --</option>
            <option value="1 day">1 day</option>
            <option value="3 days">3 days</option>
            <option value="1 week">1 week</option>
            <option value="2 weeks">2 weeks</option>
            <option value="1 month">1 month</option>
          </select>

          <label>Accepted By:</label>
          <input type="text" v-model="acceptForm.acceptedBy" readonly />

          <label>Message to User:</label>
          <textarea v-model="acceptForm.message" rows="4"></textarea>

          <div class="modal-buttons">
            <button @click="submitAccept">Save</button>
            <button @click="showAcceptModal = false">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Popups -->
    <Popup :show="showPopup" :popupType="popupType" :message="popupMessage" @close="showPopup = false" />

    <!-- Confirm Popup -->
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
// Import component Popup จากที่แยกไฟล์ไว้
import Popup from '@/Views/Component/Alert/Alert.vue';

const route = useRoute();
const router = useRouter();
const token = localStorage.getItem('token');

const complaint = ref(null);
const loading = ref(false);
const showAcceptModal = ref(false);
const replyFile = ref(null);

const acceptForm = ref({
  predict: '',
  acceptedBy: localStorage.getItem('username') || '',
  message: ''
});

// เพิ่ม state สำหรับจัดการ pop-up
const showPopup = ref(false);
const popupType = ref('');
const popupMessage = ref('');
const showConfirmPopup = ref(false);
const confirmAction = ref('');
const confirmMessage = ref('');

const lastForward = computed(() => {
  if (!complaint.value?.forwardHistory?.length) return {};
  return complaint.value.forwardHistory[complaint.value.forwardHistory.length - 1];
});

const hasReplyFile = computed(() => {
  return complaint.value?.forwardHistory?.some(fwd => fwd.replyFile);
});

function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);

  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const formatted = d.toLocaleDateString('en-GB', options);

  // แปลง ค.ศ. เป็น พ.ศ.
  const parts = formatted.split(' ');
  const day = parts[0];
  const month = parts[1];
  let year = parseInt(parts[2], 10) + 543;

  return `${day} ${month} ${year}`;
}

// ฟังก์ชันสำหรับแสดง pop-up
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

// ฟังก์ชันสำหรับแสดง Confirm pop-up
function showConfirm(message, action) {
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmPopup.value = true;
}

// ฟังก์ชันจัดการเมื่อผู้ใช้กด 'YES' ใน Confirm pop-up
async function handleConfirm() {
  showConfirmPopup.value = false;
  if (confirmAction.value === 'finishComplaint') {
    await finishComplaint();
  }
}

async function fetchComplaint() {
  loading.value = true;
  try {
    const res = await axios.get(`http://localhost:3000/complaint/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    complaint.value = res.data;
  } catch (error) {
    showError('Failed to load complaint');
    console.error(error);
  } finally {
    loading.value = false;
  }
}

function handleReplyFileChange(e) {
  replyFile.value = e.target.files[0];
  submitReplyFile();
}

async function submitAccept() {
  if (!acceptForm.value.predict) {
    showError('Please select a predict date');
    return;
  }

  try {
    await axios.post(
      `http://localhost:3000/complaint/accept/${complaint.value._id}`,
      {
        predict: acceptForm.value.predict,
        acceptedBy: acceptForm.value.acceptedBy,
        message: acceptForm.value.message
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    showSuccess('Accept info saved');
    showAcceptModal.value = false;
    await fetchComplaint();
  } catch (error) {
    showError('Failed to save accept info');
    console.error(error);
  }
}

async function submitReplyFile() {
  if (!replyFile.value) return;

  try {
    const formData = new FormData();
    formData.append('replyFile', replyFile.value);

    const forwardId = lastForward.value._id;

    await axios.post(
      `http://localhost:3000/complaint/forward/reply/${complaint.value._id}/${forwardId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    showSuccess('Reply file uploaded');
    replyFile.value = null;
    await fetchComplaint();
  } catch (error) {
    showError('Failed to upload reply file');
    console.error(error);
  }
}

async function finishComplaint() {
  try {
    await axios.post(
      `http://localhost:3000/complaint/finish/${complaint.value._id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    showSuccess('Complaint marked as finished');
    await fetchComplaint();
  } catch (error) {
    showError('Failed to finish complaint');
    console.error(error);
  }
}

onMounted(fetchComplaint);
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 40rem;
  margin: 20px 0;
}

.card-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 2rem;
}

.accept-info {
  background-color: rgba(125, 41, 35, 0.95);
  border: 2px solid #7D2923;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  color: white;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  /* background โปร่งใส */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  width: 420px;
  max-width: 90%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  animation: slideDown 0.3s ease;
}

.modal-content h3 {
  margin-bottom: 1rem;
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

.modal-content label {
  font-weight: 600;
  display: block;
  margin: 1rem 0 0.3rem;
  color: #444;
}

.modal-content select,
.modal-content input,
.modal-content textarea {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 0.8rem;
  font-size: 0.95rem;
  transition: border 0.2s;
}

.modal-content select:focus,
.modal-content input:focus,
.modal-content textarea:focus {
  border-color: black;
  outline: none;
}

.modal-buttons {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-buttons button {
  padding: 10px 25px;
  font-weight: bold;
  font-size: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  border-radius: 16px;
  transition: background-color 0.3s, color 0.3s;
}

.modal-buttons button:first-child {
  background: white;
  color: black;
}

.modal-buttons button:first-child:hover {
  background-color: black;
  color: white;
}

.modal-buttons button:last-child {
  background-color: black;
  color: white;
}

.modal-buttons button:last-child:hover {
  background-color: #aaa;
  color: white;
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

.disagree {
  background-color: black;
  color: white;
  padding: 10px 25px;
  font-weight: bold;
  font-size: 15px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  border-radius: 16px;
  transition: background-color 0.3s, color 0.3s;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

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
