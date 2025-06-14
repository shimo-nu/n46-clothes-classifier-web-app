import { createRouter, createWebHistory } from 'vue-router'
import { authGuard, useAuth0 } from '@auth0/auth0-vue'
import { watch } from 'vue'
import HomeView from '../views/HomeView.vue'
import Yolo from '../views/Yolo.vue'
import Annotation from '../views/Annotation.vue'
import NewImageView from '../views/NewImageView.vue'
import LoginView from '../views/LoginView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import AnnotationList from '../views/AnnotationList.vue'
import TrainingView from '../views/TrainingView.vue'
import Unauthorized from '../views/Unauthorized.vue'
import ProfileView from '../views/ProfileView.vue'

const rolesClaim = import.meta.env.VITE_AUTH0_ROLES_CLAIM

function roleGuard(requiredRoles: string[]) {
  return (to: any, from: any, next: any) => {
    const { isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0()

    const verify = async () => {
      let roles: any[] = (user.value as any)?.[rolesClaim] || []
      if (roles.length === 0 && isAuthenticated.value) {
        try {
          const token = await getAccessTokenSilently()
          const decoded = JSON.parse(atob(token.split('.')[1]))
          roles = decoded[rolesClaim] || []
          console.log('[roleGuard] roles from token', roles)
        } catch (e) {
          console.error('Failed to load roles', e)
        }
      }

      console.log('[roleGuard] verifying', {
        route: to.path,
        requiredRoles,
        userRoles: roles,
        isAuthenticated: isAuthenticated.value
      })

      if (isAuthenticated.value && requiredRoles.some((r) => roles.includes(r))) {
        return next()
      }
      next('/unauthorized')
    }

    if (!isLoading.value) {
      return verify()
    }

    watch(isLoading, () => {
      if (!isLoading.value) {
        console.log('[roleGuard] loading finished, verifying roles')
        verify()
      }
    })
  }
}

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
      path: '/categories',
      name: 'categories',
      component: CategoriesView,
      beforeEnter: authGuard
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
      props: (route) => ({
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
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      beforeEnter: authGuard
    },
    {
      path: '/new-annotation/:handleImage/:labelCategoryName',
      name: 'new-annotation',
      component: Annotation,
      props: (route) => ({
        handleImage: route.params.handleImage,
        labelCategoryName: route.params.labelCategoryName,
        isNewAnnotation: true
      }),
      beforeEnter: authGuard
    },
    {
      path: '/annotations',
      name: 'annotation-list',
      component: AnnotationList,
      beforeEnter: roleGuard(['staff'])
    },
    {
      path: '/training',
      name: 'training',
      component: TrainingView,
      beforeEnter: roleGuard(['staff'])
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: Unauthorized
    }
  ]
})

export default router
