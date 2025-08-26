<script>
import successImg from "@/Assets/Image/Success.png";
import failImg from "@/Assets/Image/Fail.png";

export default {
  props: {
    show: { type: Boolean, required: true },
    popupType: { type: String, required: true },
    message: { type: String, default: "" }
  },
  computed: {
    imgSrc() { return this.popupType === 'success' ? successImg : failImg; },
    title() { return this.popupType === 'success' ? 'Success' : 'Failed'; }
  }
};
</script>

<template>
  <div v-if="show" class="popup-overlay">
    <div class="popup-card">
      <img :src="imgSrc" alt="status" class="popup-img" />
      <h1>{{ title }}</h1>
      <p v-if="message">{{ message }}</p>
      <button class="agree" @click="$emit('close')">OK</button>
    </div>
  </div>
</template>

<style scoped>
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
