import axios from 'axios'
import { API_BASE_URL } from './endpoints'

const api = axios.create({ baseURL: API_BASE_URL })

export interface Annotation {
  image: string
  labelCategory: string
  boxes: any[]
}

export const annotationsApi = {
  async getAnnotations(token?: string): Promise<Annotation[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await api.get('/annotations', { headers })
    return response.data
  },

  async triggerTraining(token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    await api.post('/train', null, { headers })
  }
}
