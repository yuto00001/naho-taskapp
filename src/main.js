import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import {firebaseConfig} from '@/config/local.js'
firebase.initializeApp(firebaseConfig);

Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
