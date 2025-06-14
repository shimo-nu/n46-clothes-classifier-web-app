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
    console.log('[annotationsApi] GET /annotations')
    const response = await api.get('/annotations', { headers })
    console.log('[annotationsApi] fetched', response.data.length, 'annotations')
    return response.data
  },

  async triggerTraining(token?: string): Promise<void> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    console.log('[annotationsApi] POST /train')
    await api.post('/train', null, { headers })
    console.log('[annotationsApi] training triggered')
  }
}
