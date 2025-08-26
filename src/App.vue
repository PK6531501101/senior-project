<template>
  <div>
    <HeaderView />
    <MenuView />
    <router-view />
    <!-- ✅ แสดง Footer เฉพาะหน้าไม่ใช่ /login -->
    <FooterView v-if="$route.path !== '/login' && $route.path !== '/term-of-use' && $route.path !== '/guideline'" />
  </div>
</template>

<script>
import HeaderView from './Views/Component/Header.vue';
import MenuView from './Views/Component/Menu/Menu.vue';
import FooterView from './Views/Component/Footer.vue';

export default {
  components: { HeaderView, MenuView, FooterView }
};
</script>
