<script>
import axios from 'axios';
import Popup from "../Component/Alert/Alert.vue";

export default {
  components: { Popup },
  data: () => ({
    username: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 1,
    message: '',
    showPopup: false,
    popupType: ''
  }),
  methods: {
    focus(refName) {
      this.$refs[refName].focus();
    },
    async register() {
      if (![this.username, this.name, this.email, this.phone, this.password].every(Boolean)) {
        return this.showPopupMsg("Please fill in all fields", "fail");
      }

      try {
        const { data } = await axios.post('http://localhost:3000/register', {
          username: this.username,
          name: this.name,
          email: this.email,
          phone: this.phone,
          password: this.password,
          role: this.role
        });
        this.showPopupMsg(data.message || "Registration successful", "success");
      } catch (err) {
        this.showPopupMsg(err.response?.data?.error || "Registration failed", "fail");
      }
    },
    showPopupMsg(msg, type) {
      this.message = msg;
      this.popupType = type;
      this.showPopup = true;
    }
  }
};
</script>

<template>
  <div class="position-wrapper">
      <div class="card">
        <h2>REGISTER</h2>
        <input v-model="username" placeholder="Username" @keyup.enter="focus('nameInput')" ref="usernameInput" />
        <input v-model="name" placeholder="Full Name" @keyup.enter="focus('emailInput')" ref="nameInput" />
        <input v-model="email" placeholder="Email" @keyup.enter="focus('phoneInput')" ref="emailInput" />
        <input v-model="phone" placeholder="Phone" @keyup.enter="focus('passwordInput')" ref="phoneInput" />
        <input type="password" v-model="password" placeholder="Password" @keyup.enter="register" ref="passwordInput" />
        <button class="agree" @click="register">REGISTER</button>
      </div>

      <Popup :show="showPopup" :popupType="popupType" :message="message" @close="showPopup = false" />
    </div>
</template>

<style scoped>
.position-wrapper {
  position: absolute;
  top: 22%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.card {
  width: 300px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 2rem;
  gap: 8px;
}

input {
  width: 80%;
  padding: 10px;
  font-size: 1rem;
  border-radius: 12px;
  border: 1px solid #ccc;
}
</style>
