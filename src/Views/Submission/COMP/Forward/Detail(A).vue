<template>
  <div class="position-wrapper" v-if="complaint">
    <div class="content">
      <h1>Complaint Details</h1>

      <div class="card">
        <p><strong>Title:</strong> {{ complaint.title }}</p>
        <p><strong>Division:</strong> {{ complaint.division }}</p>
        <p><strong>Name:</strong> {{ complaint.name }}</p>
        <p><strong>Email:</strong> {{ complaint.email }}</p>
        <p><strong>Phone:</strong> {{ complaint.phone }}</p>
        <p><strong>Current Status:</strong> {{ complaint.currentStatus }}</p>
        <p><strong>Details:</strong> {{ complaint.details }}</p>
        <p>
          <strong>File:</strong>
          <a v-if="complaint.file" :href="`http://localhost:3000/uploads/complaints/${complaint.file}`" target="_blank">
            View File
          </a>
          <span v-else> No file </span>
        </p>

        <div v-if="complaint.forwardHistory && complaint.forwardHistory.length" class="info-section">
          <h3>Forward History</h3>
          <div v-for="(fwd, index) in complaint.forwardHistory" :key="fwd._id" class="forward-item" style="margin-bottom: 1rem;">
            <p><strong>To:</strong> {{ fwd.toDivision }}</p>
            <p><strong>By:</strong> {{ fwd.fromUserName }}</p>
            <p><strong>Forward Date:</strong> {{ formatDate(fwd.forwardDate) }}</p>
            <p>
              <strong>Reply File:</strong>
              <a v-if="fwd.replyFile" :href="`http://localhost:3000/uploads/complaints/${fwd.replyFile}`" target="_blank">
                View
              </a>
              <span v-else> None </span>
            </p>
          </div>
        </div>

        <div v-if="complaint.acceptInfo && complaint.acceptInfo.acceptedDate" class="info-section">
          <h3>Accept Info</h3>
          <p>Predict: {{ complaint.acceptInfo.predict }}</p>
          <p>Message: {{ complaint.acceptInfo.message }}</p>
          <p>Accepted Date: {{ formatDate(complaint.acceptInfo.acceptedDate) }}</p>
        </div>
      </div>

      <div class="card-buttons">
        <button class="agree" v-if="!isAccepted && !hasActiveForward" @click="showForwardModal = true"
          :disabled="complaint.status === 'Finished'">
          Forward
        </button>
        <button class="agree" v-else-if="!isAccepted && hasActiveForward"
          @click="showConfirm('Do you want to cancel the forward?', 'cancelForward')"
          :disabled="complaint.status === 'Finished'">
          Cancel Forward
        </button>
        <button class="agree" v-if="!isAccepted && !hasActiveForward && complaint.status !== 'Forward'"
          @click="showAcceptModal = true" :disabled="complaint.status === 'Finished'">
          Accept
        </button>
        <button class="agree" v-if="isAccepted"
          @click="showConfirm('Do you want to cancel the accept?', 'cancelAccept')"
          :disabled="complaint.status === 'Finished'">
          Cancel Accept
        </button>
        <button class="agree" v-if="showFinishButton"
          @click="showConfirm('Are you sure to finish this complaint?', 'finishComplaint')"
          :disabled="complaint.status === 'Finished'">
          Finish
        </button>
      </div>

      <!-- Forward Modal -->
      <div v-if="showForwardModal" class="modal">
        <div class="modal-content">
          <h3>Forward Complaint</h3>
          <label>Send to Division:</label>
          <select v-model="forwardForm.toDivision" required>
            <option v-for="division in orderedDivisions" :key="division._id" :value="division.name">
              {{ division.name }}
            </option>
          </select>
          <div class="modal-buttons">
            <button @click="submitForward">Send</button>
            <button @click="showForwardModal = false">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Accept Modal -->
      <div v-if="showAcceptModal" class="modal">
        <div class="modal-content">
          <h3>Accept Complaint</h3>
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
  </div>

  <div v-else>
    Loading...
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
const showForwardModal = ref(false);
const showAcceptModal = ref(false);

const forwardForm = ref({
  toDivision: '',
});

const username = localStorage.getItem('username') || '';

const acceptForm = ref({
  predict: '',
  acceptedBy: username,
  message: ''
});

const divisions = ref([]);

// เพิ่ม state สำหรับจัดการ pop-up
const showPopup = ref(false);
const popupType = ref('');
const popupMessage = ref('');
const showConfirmPopup = ref(false);
const confirmAction = ref('');
const confirmMessage = ref('');

// เรียง divisions
const orderedDivisions = computed(() => {
  if (!complaint.value || !divisions.value.length) return [];
  const selected = complaint.value.division;
  const sorted = [...divisions.value];
  sorted.sort((a, b) => {
    if (a.name === selected) return -1;
    if (b.name === selected) return 1;
    return 0;
  });
  return sorted;
});

async function fetchDivisions() {
  try {
    const res = await axios.get('http://localhost:3000/divisions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    divisions.value = res.data;
  } catch (err) {
    console.error('Failed to fetch divisions', err);
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

const isAccepted = computed(() => {
  return complaint.value?.acceptInfo?.acceptedDate;
});

const hasActiveForward = computed(() => {
  if (!complaint.value?.forwardHistory?.length) return false;
  const latest = complaint.value.forwardHistory[complaint.value.forwardHistory.length - 1];
  return !latest.finished;
});

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
  if (confirmAction.value === 'cancelForward') {
    await cancelForward();
  } else if (confirmAction.value === 'cancelAccept') {
    await cancelAccept();
  } else if (confirmAction.value === 'finishComplaint') {
    await finishComplaint();
  }
}

async function cancelForward() {
  const latest = complaint.value.forwardHistory[complaint.value.forwardHistory.length - 1];
  if (!latest) return;
  try {
    await axios.post(
      `http://localhost:3000/complaint/cancel-forward/${complaint.value._id}`,
      { forwardId: latest._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    showSuccess('Forward canceled successfully.');
    fetchComplaint();
  } catch (err) {
    showError('Failed to cancel forward.');
    console.error(err);
  }
}

async function cancelAccept() {
  try {
    await axios.post(`http://localhost:3000/complaint/cancel-accept/${complaint.value._id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    complaint.value.status = 'On Process';
    complaint.value.acceptInfo = null;
    showSuccess('Accept canceled and status reverted to On Process.');
    fetchComplaint();
  } catch (err) {
    showError('Failed to cancel accept.');
    console.error(err);
  }
}

const showFinishButton = computed(() => {
  if (!complaint.value) return false;
  const hasAccept = complaint.value.acceptInfo && complaint.value.acceptInfo.acceptedDate;
  const hasForwardWithReply =
    complaint.value.forwardHistory &&
    complaint.value.forwardHistory.length > 0 &&
    complaint.value.forwardHistory.every(fwd => !!fwd.replyFile);
  return hasAccept || hasForwardWithReply;
});

async function fetchComplaint() {
  try {
    const res = await axios.get(`http://localhost:3000/complaint/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    complaint.value = res.data;
  } catch (err) {
    showError('Failed to load complaint detail.');
    console.error(err);
  }
}

async function submitForward() {
  if (!forwardForm.value.toDivision) {
    showError('Please select a division to forward.');
    return;
  }
  try {
    await axios.post(`http://localhost:3000/complaint/forward/${complaint.value._id}`, {
      toDivision: forwardForm.value.toDivision
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    complaint.value.status = 'Forward';
    showSuccess('Forward saved and status updated to Forward.');
    showForwardModal.value = false;
    fetchComplaint();
  } catch (err) {
    showError('Failed to forward complaint.');
    console.error(err);
  }
}

async function submitAccept() {
  if (!acceptForm.value.predict || !acceptForm.value.acceptedBy) {
    showError('Please fill predict and accepted by.');
    return;
  }
  try {
    await axios.post(`http://localhost:3000/complaint/accept/${complaint.value._id}`, acceptForm.value, {
      headers: { Authorization: `Bearer ${token}` }
    });
    complaint.value.status = 'Accept';
    showSuccess('Accept info saved and status updated to Accept.');
    showAcceptModal.value = false;
    fetchComplaint();
  } catch (err) {
    showError('Failed to save accept info.');
    console.error(err);
  }
}

async function finishComplaint() {
  try {
    await axios.post(`http://localhost:3000/complaint/finish/${complaint.value._id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    showSuccess('Complaint marked as finished.');
    fetchComplaint();
  } catch (err) {
    showError('Failed to finish complaint.');
    console.error(err);
  }
}

onMounted(() => {
  fetchComplaint();
  fetchDivisions();
});
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
}

.card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 700px;
  margin-bottom: 1.5rem;
}

/* Section สีฟ้าอ่อน */
.info-section {
  background-color: rgba(125, 41, 35, 0.95);
  border: 2px solid #7D2923;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  color: white;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
}

/* ปุ่มด้านล่าง */
.card-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 2rem;
}

.card-buttons button {
  padding: 10px 25px;
  font-weight: bold;
  font-size: 15px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  border-radius: 16px;
  transition: background-color 0.3s, color 0.3s;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
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

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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
