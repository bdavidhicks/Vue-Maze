import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from './components/Home.vue';

Vue.use(VueRouter);

export default [
  { path: '/', component: Home },
  { path: '/:catchAll(.*)', redirect: '/' },
];
