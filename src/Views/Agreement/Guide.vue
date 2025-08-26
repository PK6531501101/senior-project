<template>
  <div class="position-wrapper">
    <div class="content">
      <h1>GUIDELINE FOR REPORTING</h1>
      <h4>PLEASE READ AND ACCEPT THE TERMS TO CONTINUE</h4>

      <div class="terms-box">
        <ul>
          <li>Complainants must use polite and respectful language.</li>
          <li>Complainants are required to provide their full name, address, national ID number, phone number,
            and email address to verify their identity and for follow-up communication.</li>
          <li>Complainants must specify the name of the agency or official involved in the reported incident.
          </li>
          <li>Complainants must clearly describe the actions that led to the complaint, along with relevant
            facts or circumstances, or provide specific information or leads about the suspected misconduct
            to support the investigation process.</li>
          <li>Complainants must state their request or desired outcome regarding the complaint.</li>
          <li>Complainants should include any supporting documents, physical evidence, or witnesses (if
            available).</li>
          <li>This is in accordance with Mae Fah Luang University’s Announcement on Measures for Handling
            Complaints about Corruption and Misconduct, B.E. 2563 (2020).</li>
        </ul>

        <div class="responsible-unit">
          <h5>Responsible Unit: Legal Affairs Division, Mae Fah Luang University</h5>
        </div>
      </div>

      <button @click="goToTarget" class="agree">CONTINUE</button>

      <div v-if="showWarning" class="popup-overlay">
        <div class="popup-card">
          <img :src="warningImg" alt="warning" class="popup-img" />
          <h1>Warning</h1>
          <p>Do you want to follow up on your report?</p>
          <div class="button-row">
            <button class="agree" @click="handleResponse('yes')">YES</button>
            <button class="agree" @click="handleResponse('no')">NO</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import warningImg from "@/Assets/Image/Warning.png";

export default {
  data() {
    return {
      target: this.$route.query.target || '/',
      isLoggedIn: !!localStorage.getItem('token'),
      showWarning: false,
      warningImg
    };
  },
  methods: {
    goToTarget() {
      if (['complaint', 'corruption'].includes(this.target) && !this.isLoggedIn) {
        this.showWarning = true;
        return;
      }
      this.$router.push('/' + this.target);
    },
    handleResponse(answer) {
      this.showWarning = false;
      if (answer === 'yes') {
        this.$router.push('/login');
      } else {
        this.$router.push('/' + this.target);
      }
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

.terms-box {
  background: white;
  border-radius: 8px;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 800px;
  margin: 2rem 0;
  overflow-y: auto;
  max-height: 1000px;
  line-height: 1.6;
}

.terms-box li {
  margin-bottom: 1rem;
}

.responsible-unit {
  width: 100%;
  text-align: right;
  margin-top: 3rem;
}

.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-card {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem 1rem;
  width: 300px;
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
