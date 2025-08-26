<script>
import axios from 'axios';
import Popup from "@/Views/Component/Alert/Alert.vue";

export default {
  components: { Popup },
  data: () => ({
    form: {
      name: "",
      address: "",
      idCard: "",
      phone: "",
      email: "",
      currentStatus: "",
      reportedName: "",
      position: "",
      division: "",
      location: "",
      dateOfIncident: "",
      description: "",
      requestAction: "",
    },
    file: null,
    divisions: [],
    isLoggedIn: !!localStorage.getItem('token'),
    missingFields: [],
    message: "",
    showPopup: false,
    popupType: "",
    requiredFields: [
      'name', 'address', 'idCard', 'phone', 'email', 'currentStatus',
      'reportedName', 'division', 'location', 'dateOfIncident',
      'description', 'requestAction'
    ],
  }),
  computed: {
    currentDate() {
      const today = new Date();
      const day = today.getDate();
      const month = today.toLocaleString("en-US", { month: "long" });
      const year = today.getFullYear() + 543;
      return `${day} ${month} ${year}`;
    }
  },
  mounted() {
    this.loadDivisions();
    if (this.isLoggedIn) this.loadProfile();
  },
  methods: {
    showMessage(type, msg) {
      this.message = msg;
      this.popupType = type;
      this.showPopup = true;
    },
    async loadDivisions() {
      try {
        const res = await axios.get("http://localhost:3000/divisions");
        this.divisions = res.data;
      } catch (err) {
        this.showMessage('fail', 'Failed to load divisions. Please try again.');
        console.error("Failed to load divisions:", err);
      }
    },
    async loadProfile() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get("http://localhost:3000/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { name, email, phone } = res.data;
        this.form.name = name || '';
        this.form.email = email || '';
        this.form.phone = phone || '';
      } catch (err) {
        this.showMessage('fail', 'Failed to load user profile. Please try again.');
        console.error("Failed to load profile:", err);
        this.form.name = '';
        this.form.email = '';
        this.form.phone = '';
      }
    },
    handleFileUpload(event) {
      this.file = event.target.files[0];
      if (this.file) {
        this.clearMissingField('file');
      }
    },
    handleDrop(event) {
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile) {
        this.file = droppedFile;
        this.clearMissingField('file');
      }
    },

    validateIdCard() {
      const idCard = this.form.idCard;
      if (idCard && !/^\d+$/.test(idCard)) {
        this.showMessage('fail', 'ID Card must be digits only.');
        return false;
      }
      if (idCard.length > 0 && idCard.length !== 13) {
        this.showMessage('fail', 'ID Card must be 13 digits.');
        return false;
      }
      return true;
    },

    validatePhoneNumber() {
      const phone = this.form.phone;
      if (phone && !/^\d+$/.test(phone)) {
        this.showMessage('fail', 'Phone Number must be digits only.');
        return false;
      }
      return true;
    },

    validateEmail() {
      const email = this.form.email;
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !regex.test(email)) {
        this.showMessage('fail', 'Invalid email format.');
        return false;
      }
      return true;
    },

    validateForm() {
      this.missingFields = this.requiredFields.filter(field => !this.form[field]);
      if (this.missingFields.length > 0) {
        const firstMissingField = this.missingFields[0];
        this.$refs[firstMissingField]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
      return true;
    },
    async submitForm() {
      if (!this.validateForm()) {
        this.showMessage('fail', 'Please fill in all required fields.');
        return;
      }

      if (!this.validateIdCard() || !this.validatePhoneNumber() || !this.validateEmail()) {
        return; // ถ้าไม่ผ่านสักอันจะหยุด
      }

      const formData = new FormData();
      for (const key in this.form) {
        formData.append(key, this.form[key]);
      }
      if (this.file) {
        formData.append("file", this.file);
      }

      try {
        await axios.post("http://localhost:3000/corruption", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        this.showMessage('success', 'Form submitted successfully!');
        setTimeout(() => {
          this.$router.push(this.isLoggedIn ? '/track' : '/home-user');
        }, 1000);
      } catch (err) {
        this.showMessage('fail', err.response?.data?.error || 'Error submitting form. Please try again.');
        console.error(err);
      }
    },
    cancelForm() {
      this.$router.push('/home-user');
    },
    clearMissingField(field) {
      const index = this.missingFields.indexOf(field);
      if (index > -1) {
        this.missingFields.splice(index, 1);
      }
    }
  },
};
</script>

<template>
  <div class="position-wrapper">
    <div class="content">
      <h1>Corruption Report Form</h1>
      <h2>{{ currentDate }}</h2>

      <form @submit.prevent="submitForm">
        <div class="card">
          <h3>Personal Information</h3>
          <div :class="{ 'invalid-border': missingFields.includes('name') }" ref="name">
            <h4>Full Name*
              <input type="text" v-model="form.name" :readonly="isLoggedIn" placeholder="Full Name" @input="clearMissingField('name')" />
            </h4>
          </div>

          <div :class="{ 'invalid-border': missingFields.includes('address') }" ref="address">
            <h4>Address*
              <input type="text" v-model="form.address" placeholder="Address" @input="clearMissingField('address')" />
            </h4>
          </div>

          <div :class="{ 'invalid-border': missingFields.includes('idCard') }" ref="idCard">
            <h4>ID Card*
              <input type="text" v-model="form.idCard" placeholder="ID Card" title="ID Card must be 13 digits only"
                @input="clearMissingField('idCard')" />
            </h4>
          </div>

          <div :class="{ 'invalid-border': missingFields.includes('phone') }" ref="phone">
            <h4>Phone Number*
              <input type="tel" v-model="form.phone" :readonly="isLoggedIn" placeholder="Phone Number"
                title="Phone Number must be digits only" @input="clearMissingField('phone')" />
            </h4>
          </div>

          <div :class="{ 'invalid-border': missingFields.includes('email') }" ref="email">
            <h4>Email*
              <input type="text" v-model="form.email" :readonly="isLoggedIn" placeholder="Email" title="Invalid email format"
                @input="clearMissingField('email')" />
            </h4>
          </div>

          <div :class="{ 'invalid-border': missingFields.includes('currentStatus') }" ref="currentStatus">
            <h4>Current Status*</h4>
            <label><input type="radio" value="student" v-model="form.currentStatus"
                @change="clearMissingField('currentStatus')" /> Student</label>
            <label><input type="radio" value="staff" v-model="form.currentStatus"
                @change="clearMissingField('currentStatus')" /> Staff</label>
            <label><input type="radio" value="alumni" v-model="form.currentStatus"
                @change="clearMissingField('currentStatus')" /> Alumni</label>
            <label><input type="radio" value="public" v-model="form.currentStatus"
                @change="clearMissingField('currentStatus')" /> General Public</label>
          </div>

          <hr>
          <h3>Reported Person Information</h3>
          <div :class="{ 'invalid-border': missingFields.includes('reportedName') }" ref="reportedName">
            <h4>Full Name of the Person Being Reported*
              <input type="text" v-model="form.reportedName" placeholder="Full Name" @input="clearMissingField('reportedName')" />
            </h4>
          </div>
          <h4>Position (if known)
            <input type="text" v-model="form.position" placeholder="Position" />
          </h4>

          <div :class="{ 'invalid-border': missingFields.includes('division') }" ref="division">
            <h4>Division*
              <select v-model="form.division" @change="clearMissingField('division')">
                <option disabled value="">Select Division</option>
                <option v-for="div in divisions" :key="div._id" :value="div.name">
                  {{ div.name }}
                </option>
              </select>
            </h4>
          </div>

          <hr>
          <h3>Incident Information</h3>
          <div :class="{ 'invalid-border': missingFields.includes('location') }" ref="location">
            <h4>Location of Incident*
              <input type="text" v-model="form.location" placeholder="Location" @input="clearMissingField('location')" />
            </h4>
          </div>

          <div :class="{ 'invalid-border': missingFields.includes('dateOfIncident') }" ref="dateOfIncident">
            <h4>Date of Incident*
              <input type="date" v-model="form.dateOfIncident" @input="clearMissingField('dateOfIncident')" />
            </h4>
          </div>

          <hr>
          <h3>Complaint Details</h3>
          <div :class="{ 'invalid-border': missingFields.includes('description') }" ref="description">
            <h4>Description of the Complaint (Circumstances)*
              <textarea v-model="form.description" rows="4" placeholder="Description" @input="clearMissingField('description')"></textarea>
            </h4>
          </div>

          <div :class="{ 'invalid-border': missingFields.includes('requestAction') }" ref="requestAction">
            <h4>Request for University Action*
              <textarea v-model="form.requestAction" rows="4" placeholder="Request" @input="clearMissingField('requestAction')"></textarea>
            </h4>
          </div>

          <hr>
          <h3>Upload File (optional)</h3>
          <div class="file-drop-zone" @dragover.prevent @dragenter.prevent @drop.prevent="handleDrop"
            @click="$refs.fileInput.click()">
            <p v-if="!file">Drag & Drop file here or click to select</p>
            <p v-else>Selected: {{ file.name }}</p>
            <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none;" />
          </div>
        </div>

        <div class="button-group">
          <button class="disagree" type="button" @click="cancelForm">Cancel</button>
          <button class="agree" type="submit">Submit</button>
        </div>
      </form>
    </div>
    <Popup :show="showPopup" :popupType="popupType" :message="message" @close="showPopup = false" />
  </div>
</template>

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

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="date"],
select,
textarea {
  width: 100%;
  padding: 6px;
  margin-top: 4px;
  box-sizing: border-box;
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

form {
  width: 100%;
  max-width: 50rem;
}

label {
  display: block;
  margin-bottom: 10px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.invalid-border {
  border-radius: 12px;
  border: 1px solid rgba(255, 0, 0, 0.2);
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.2);
  padding: 10px;
  margin: 10px 0;
  transition: all 0.5s ease;
}

.file-drop-zone {
  width: 100%;
  min-height: 80px;
  padding: 6px;
  margin-top: 4px;
  box-sizing: border-box;
  border-radius: 8px;
  border: 2px dashed #ccc;
  background-color: #fff;
  cursor: pointer;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s ease;
}

.file-drop-zone:hover {
  background-color: #f9f9f9;
}
</style>