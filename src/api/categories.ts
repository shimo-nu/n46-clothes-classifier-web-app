import axios from 'axios';

export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://192.168.207.227:18080/api';

// axiosインスタンスの作成
const api = axios.create({
  baseURL: API_BASE_URL
});

// リクエストインターセプターの設定
api.interceptors.request.use(async (config) => {
  // Auth0のトークンはVueコンポーネント内で管理し、
  // 必要な場合はコンポーネントから渡すようにします
  return config;
});

export const categoriesApi = {
  // カテゴリ一覧の取得
  async getCategories(token?: string): Promise<Category[]> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await api.get('/categories', { headers });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('認証エラー：ログインが必要です');
        } else if (error.response?.status === 403) {
          throw new Error('権限エラー：アクセス権限がありません');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('タイムアウトエラー：サーバーとの通信がタイムアウトしました');
        } else if (!error.response) {
          throw new Error('ネットワークエラー：サーバーに接続できません。サーバーがHTTPSで実行されていることを確認してください。');
        }
      }
      throw new Error('カテゴリデータの取得に失敗しました');
    }
  },

  // 新しいカテゴリの追加
  async createCategory(category: Omit<Category, 'id'>, token?: string): Promise<Category> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post('/categories', category, { headers });
    return response.data;
  },

  // 新しいサブカテゴリの追加
  async createSubCategory(categoryId: string, subCategory: Omit<SubCategory, 'id'>, token?: string): Promise<SubCategory> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post('/subcategories', {
      categoryId,
      ...subCategory
    }, { headers });
    return response.data;
  }
};
