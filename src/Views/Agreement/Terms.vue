<template>
  <div class="position-wrapper">
    <div class="content">
      <h1>TERMS OF USE</h1>
      <h4>PLEASE READ AND ACCEPT THE TERMS TO CONTINUE</h4>

      <div class="terms-box">
        <ul>
          <li>
            The VOC (Voice of Customer) system is a communication channel established to gather feedback from students,
            staff, alumni, and the general public. It collects comments, suggestions, and complaints regarding all
            aspects of Mae Fah Luang University's services.
          </li>
          <li>
            When submitting a complaint or reporting a service issue, it is important to provide essential information
            such as your full name, email address, phone number, a clear description of the issue, the date and time of
            the incident, relevant system details, and any supporting images (if available). This helps us to respond
            promptly and effectively.
          </li>
          <li>All submissions should be written in polite, respectful, and lawful language.</li>
          <li>
            Submitting false or misleading information, or complaints intended to harm others or made in bad faith, may
            result in civil, disciplinary, or legal consequences for the complainant.
          </li>
          <li>
            Complaints should concern issues that caused distress or harm, or requests for correction resulting from the
            actions of university personnel or departments under Mae Fah Luang University.
          </li>
          <li>
            If the submitted information is incomplete or anonymous, and our office is unable to contact the complainant
            for further clarification, we reserve the right not to proceed with the case. However, constructive and
            beneficial suggestions will still be considered to help improve university services.
          </li>
          <li>
            Anonymous submissions or unverified identities may still be reviewed if there is clear supporting evidence,
            well-documented circumstances, or specific witnesses that allow further investigation and serve the public
            interest.
          </li>
          <li>
            Once a submission is received, if an email address is provided, the system will automatically track the
            progress of the case and notify the complainant of the outcome or relevant actions taken via email in a
            timely manner.
          </li>
          <li>
            All information received will be treated as confidential, in accordance with government or internal
            policies. The identity of whistleblowers will be protected. Anonymous submissions will be reviewed only when
            sufficient evidence and identifiable witnesses are provided.
          </li>
        </ul>
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
