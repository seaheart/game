import Vue from "vue";
import App from "./App.vue";
import router from "./router";

Vue.router = router;

new Vue({ router, render: h => h(App) }).$mount("#app");
