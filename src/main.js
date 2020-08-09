import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import 'bootstrap';
import './assets/app.scss';
import routes from './routes';

Vue.config.productionTip = false;

const router = new VueRouter({
  routes,
  mode: 'history',
});

new Vue({
  render: (h) => h(App),
  router,
}).$mount('#app');
