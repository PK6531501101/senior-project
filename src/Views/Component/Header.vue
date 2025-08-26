<script>
export default {
  data: () => ({
    isLoggedIn: false,
    name: '',
    division: '',
    showMenu: false
  }),
  methods: {
    updateUserInfo() {
      this.isLoggedIn = !!localStorage.getItem('token');
      this.name = localStorage.getItem('name') || '';
      this.division = localStorage.getItem('division') || '';
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    closeMenu() {
      this.showMenu = false;
    },
    handleAuth() {
      if (this.isLoggedIn) {
        ['token', 'name', 'division', 'role'].forEach(k => localStorage.removeItem(k));
      }
      this.$router.push('/login');
      this.updateUserInfo();
      this.closeMenu();
      window.dispatchEvent(new Event("user-updated"));
    },
    handleClickOutside(e) {
      if (!this.$el.contains(e.target)) this.closeMenu();
    }
  },
  watch: {
    $route: 'updateUserInfo'
  },
  mounted() {
    this.updateUserInfo();
    document.addEventListener('click', this.handleClickOutside);
    window.addEventListener("user-updated", this.updateUserInfo);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener("user-updated", this.updateUserInfo);
  }
};
</script>

<template>
  <header class="header">
    <div class="left-section">
      <img src="@/Assets/Image/Logo.png" alt="Logo" class="logo" @click="$router.push('/')" />
      <div class="voc-text">
        <strong><span>VOC.MFU</span></strong>
        <span class="mfu-text">Mae Fah Luang University</span>
      </div>
    </div>

    <div class="right-section">
      <div class="profile-wrapper">
        <img src="@/Assets/Image/Profile.png" alt="Profile" class="profile-icon" @click.stop="toggleMenu" />
        <div v-if="showMenu" class="dropdown-menu">
          <button @click="handleAuth">{{ isLoggedIn ? 'LOGOUT' : 'LOGIN' }}</button>
        </div>
      </div>
      <div class="user-info">
        <strong><span>{{ isLoggedIn ? name : 'LOGIN' }}</span></strong>
        <span class="user-division" v-if="isLoggedIn">{{ division }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.left-section {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo {
  height: 45px;
  cursor: pointer;
}

.voc-text {
  display: flex;
  flex-direction: column;
  font-size: 1.1rem;
}

.mfu-text,
.user-division {
  font-size: 0.85rem;
  color: gray;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.profile-wrapper {
  position: relative;
  padding-top: 0.25rem;
}

.profile-icon {
  height: 30px;
}

.dropdown-menu {
  position: fixed;
  top: 65px;
  right: 18px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 5px 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 9999;
}

.dropdown-menu button {
  background: none;
  border: none;
  padding: 8px 20px;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
