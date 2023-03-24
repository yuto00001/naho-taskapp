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
    path: '/SignIn',
    name: 'SignIn',
    component: () => import('../views/SignIn.vue')
  },
  {
    path: '/SettingProfile',
    name: 'SettingProfile',
    component: () => import('../views/SettingProfile.vue')
  },
  {
    path: '/MyPage',
    name: 'MyPage',
    component: () => import('../views/MyPage.vue')
  },
  {
    path: '/AllArchive',
    name: 'AllArchive',
    component: () => import('../views/AllArchive.vue')
  },
]

const router = new VueRouter({
  routes
})

export default router
