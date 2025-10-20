import { createRouter, createWebHistory } from 'vue-router';
import LoginFleetsync from '../views/LoginFleetsync.vue';
import DashboardFleetsync from '../views/DashboardFleetsync.vue';

const routes = [
  { path: '/', component: LoginFleetsync },
  { path: '/dashboard', component: DashboardFleetsync },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    if (to.path === '/dashboard' && !token) {
      return next('/');
    }
    next();
  });
  

export default router;
