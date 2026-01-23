import { createApp } from "vue";
import "./style.css";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/display.css";
import App from "./App.vue";
import "katex/dist/katex.min.css";
import { router } from "./router";

createApp(App).use(router).mount("#app");
