import { ref, watchEffect } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'

const rolesClaim = import.meta.env.VITE_AUTH0_ROLES_CLAIM

export function useRoles() {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0()
  const roles = ref<string[]>([])

  const loadRoles = async () => {
    let list: any[] | undefined = (user.value as any)?.[rolesClaim]
    if (!list && isAuthenticated.value) {
      try {
        const token = await getAccessTokenSilently()
        const decoded = JSON.parse(atob(token.split('.')[1]))
        list = decoded[rolesClaim] || []
      } catch (e) {
        console.error('Failed to read roles from token', e)
      }
    }
    roles.value = Array.isArray(list) ? list : []
  }

  watchEffect(() => {
    if (isAuthenticated.value) {
      loadRoles()
    } else {
      roles.value = []
    }
  })

  return { roles }
}
