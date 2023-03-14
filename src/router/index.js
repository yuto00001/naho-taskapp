import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/MyPage',
    name: 'MyPage',
    component: () => import('../views/MyPage.vue')
  },
  {
    path: '/SignIn',
    name: 'SignIn',
    component: () => import('../views/SignIn.vue')
  },
]

const router = new VueRouter({
  routes
})

export default router
