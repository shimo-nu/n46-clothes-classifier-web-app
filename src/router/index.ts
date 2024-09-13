import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Yolo from '../views/Yolo.vue'
import Annotation from '../views/Annotation.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: HomeView
    // },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // },
    {
      path: '/clothes-classification',
      name: 'clothes-classification',
      component: Yolo,
      props: { classificationType: 'uniform' }
    },
    {
      path: '/music-costume-classification',
      name: 'music-costume-classification',
      component: Yolo,
      props: { classificationType: 'musicCostume' }
    },
    {
      path: '/annotation',
      name: 'annotation',
      component: Annotation,
      props: route => ({ 
        handleImage: route.query.handleImage, 
        labelCategoryName: route.query.labelCategoryName })
    }
  ]
})

export default router
