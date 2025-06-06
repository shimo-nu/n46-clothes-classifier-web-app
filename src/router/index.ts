import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@auth0/auth0-vue'
import HomeView from '../views/HomeView.vue'
import Yolo from '../views/Yolo.vue'
import Annotation from '../views/Annotation.vue'
import NewImageView from '../views/NewImageView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/clothes-classification',
      name: 'clothes-classification',
      component: Yolo,
      props: { classificationType: 'uniform' },
      beforeEnter: authGuard
    },
    {
      path: '/music-costume-classification',
      name: 'music-costume-classification',
      component: Yolo,
      props: { classificationType: 'musicCostume' },
      beforeEnter: authGuard
    },
    {
      path: '/annotation/:handleImage/:labelCategoryName',
      name: 'annotation',
      component: Annotation,
      props: route => ({ 
        handleImage: route.params.handleImage, 
        labelCategoryName: route.params.labelCategoryName 
      }),
      beforeEnter: authGuard
    },
    {
      path: '/new-image',
      name: 'new-image',
      component: NewImageView,
      beforeEnter: authGuard
    },
    {
      path: '/new-annotation/:handleImage/:labelCategoryName',
      name: 'new-annotation',
      component: Annotation,
      props: route => ({ 
        handleImage: route.params.handleImage, 
        labelCategoryName: route.params.labelCategoryName,
        isNewAnnotation: true
      }),
      beforeEnter: authGuard
    }
  ]
})

export default router
