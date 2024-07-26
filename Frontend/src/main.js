import { createApp } from 'vue'
import App from './App.vue'
import '../tailwind.css'
// import router from './router';

createApp(App).mount('#app')

 import { createRouter, createWebHistory } from 'vue-router';
 import HomePage from './components/HomePage.vue';
import LoginPage from './components/LoginPage.vue';

const routes = [
  {
    path: '/',
    redirect: '/login', // Redirect root to /home
  },
  {
    path: '/home',
    component: HomePage,
  },
  {
    path: '/login',
    component: LoginPage,
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


// const app=createApp(LoginPage);
// const app = createApp(HomePage);
const app = createApp(App);

app.use(router);
app.mount('#app');


