export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://192.168.207.227:18080/api'

export const ENDPOINTS = {
  CATEGORIES: `${API_BASE_URL}/categories/`,
  IMAGES: `${API_BASE_URL}/images/`,
  ANNOTATIONS: `${API_BASE_URL}/upload_with_annotations/`,
  INFERENCE: `${API_BASE_URL}/inference/`,
  TRAINING: `${API_BASE_URL}/training/`,
}
