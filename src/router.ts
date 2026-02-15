import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/home/",
    },
    {
      path: "/login",
      component: () => import("./components/Login.vue"),
      name: "login",
    },
    {
      path: "/home/:id?",
      component: () => import("./components/Home.vue"),
      name: "home",
    },
  ],
});
