<script>
export default {
  data: () => ({
    showFooter: false,
    isLoggedIn: !!localStorage.getItem("token")
  }),
  methods: {
    goLoginOrLogout() {
      if (this.isLoggedIn) {
        ['token'].forEach(k => localStorage.removeItem(k));
        this.isLoggedIn = false;
        this.$router.push("/");
      } else {
        this.$router.push("/login");
      }
    },
    hideFooter() { this.showFooter = false; },
    handleScroll() {
      const scrollTop = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      this.showFooter = scrollTop + windowHeight >= docHeight;
    },
    handleRouteChange() {
      this.hideFooter();
      this.isLoggedIn = !!localStorage.getItem("token");
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    this.unwatch = this.$router.afterEach(this.handleRouteChange);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    if (this.unwatch) this.unwatch();
  }
};
</script>

<template>
  <transition name="fade">
    <footer v-if="showFooter" class="footer">
      <div class="footer-left">
        <img src="@/Assets/Image/Lock.png" alt="Lock" class="lock-icon" />
        <button class="text-btn" @click="goLoginOrLogout">
          STAFF LOGIN
        </button>
      </div>

      <div class="footer-right">
        <div class="info-columns">
          <div class="contacts">
            <p class="head-text"><strong>Contact</strong></p>
            <p>Phone: 0-5391-6411</p>
            <p>Email: <a href="mailto:cits@mfu.ac.th" @click="hideFooter">cits@mfu.ac.th</a></p>
            <p>Facebook: <a href="https://www.facebook.com/fb.mfu.cits/" target="_blank"
                @click="hideFooter">CITS.MFU</a></p>
          </div>
          <div class="address">
            <p class="head-text"><strong>Address</strong></p>
            <p>Academic Services Building (AS)</p>
            <p>333 Moo 1, Thasud, Muang, Chiang Rai 57100</p>
          </div>
        </div>
      </div>
    </footer>
  </transition>
</template>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #7d2923;
  color: whitesmoke;
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.footer-left {
  display: flex;
  align-items: center;
  cursor: pointer;
  opacity: 0.3;
}

.footer-left:hover {
  opacity: 0.8;
}

.lock-icon {
  width: 15px;
  margin-right: 0.5rem;
  filter: brightness(0) invert(1);
}

.text-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding-top: 4px;
}

.footer-right {
  max-width: 400px;
  font-size: 14px;
}

.info-columns {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
}

.address p,
.contacts p {
  margin: 0;
  line-height: 1.5;
}

.footer-right a {
  color: white;
  text-decoration: none;
}

.footer-right a:hover {
  text-decoration: underline;
}

.contacts p:first-child,
.address p:first-child {
  margin-left: -15px;
}

.head-text {
  font-size: 16px;
}
</style>
