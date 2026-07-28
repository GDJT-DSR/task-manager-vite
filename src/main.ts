import { createApp } from "vue";
import "./style.css";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/display.css";
import App from "./App.vue";
import "katex/dist/katex.min.css"; // 引入katex的css
import { router } from "./router";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
// @ts-ignore: no declaration file for vue3-katex
import Vue3Katex from "vue3-katex";

const app = createApp(App);
app.use(Vue3Katex);
app.use(router);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount("#app");
