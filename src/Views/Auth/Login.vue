<script>
import axios from "axios";
import Popup from "../Component/Alert/Alert.vue";

export default {
  components: { Popup },
  data: () => ({
    username: "",
    password: "",
    message: "",
    showPopup: false,
    popupType: "",
  }),
  methods: {
    focusPassword() { this.$refs.passwordInput.focus(); },
    async login() {
      if (!this.username || !this.password) {
        this.showError("Please enter username and password");
        return;
      }

      try {
        const { data } = await axios.post("http://localhost:3000/login", {
          username: this.username,
          password: this.password,
        });

        localStorage.setItem("token", data.token);
        localStorage.setItem("name", data.user.name);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("division", data.user.division);

        window.dispatchEvent(new Event("user-updated"));

        this.showSuccess("Login successful");
        setTimeout(() => {
          const role = data.user.role;
          if (role === 1) this.$router.push("/home-user");
          else if (role === 2 || role === 3) this.$router.push("/home-admin");
          else this.showError("Access denied");
        }, 1000);
      } catch (err) {
        this.showError(err.response?.data?.error || "Login failed");
      }
    },
    showError(msg) { this.message = msg; this.popupType = "fail"; this.showPopup = true; },
    showSuccess(msg) { this.message = msg; this.popupType = "success"; this.showPopup = true; },
  },
};
</script>

<template>
  <div class="position-wrapper">
    <div class="card">
      <h2>LOGIN</h2>
      <input v-model="username" placeholder="Username" @keyup.enter="focusPassword" ref="usernameInput" />
      <input type="password" v-model="password" placeholder="Password" @keyup.enter="login" ref="passwordInput" />
      <button class="agree" @click="login">LOGIN</button>
    </div>

    <Popup :show="showPopup" :popupType="popupType" :message="message" @close="showPopup = false" />
  </div>
</template>

<style scoped>
.position-wrapper {
  position: absolute;
  top: 32%;
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
