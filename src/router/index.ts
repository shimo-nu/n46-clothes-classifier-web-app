import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Yolo from '../views/Yolo.vue'
import Annotation from '../views/Annotation.vue'
import NewImageView from '../views/NewImageView.vue'

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
      path: '/annotation:handleImage/:labelCategoryName',
      name: 'annotation',
      component: Annotation,
      props: route => ({ 
        handleImage: route.params.handleImage, 
        labelCategoryName: route.params.labelCategoryName })
    },
    {
      path: '/new-image',
      name: 'new-image',
      component: NewImageView
    },
    {
      path: '/new-annotation/:handleImage/:labelCategoryName',
      name: 'new-annotation',
      component: Annotation,
      props: route => ({ 
        handleImage: route.params.handleImage, 
        labelCategoryName: route.params.labelCategoryName,
        isNewAnnotation: true
      })
    }
  ]
})

export default router
