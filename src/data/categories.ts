import { uniform, music_costume } from './yolo_classes';

interface SubCategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

// 制服カテゴリの作成
const uniformCategory: Category = {
  id: 'uniform',
  name: '制服',
  subCategories: uniform.map(item => ({
    id: item,
    name: item.replace('_uniform', '号制服')
  }))
};

// 衣装カテゴリの作成
const costumeCategory: Category = {
  id: 'costume',
  name: '衣装',
  subCategories: music_costume
    .filter(item => item.includes('music_costume'))
    .map(item => ({
      id: item,
      name: item.replace('_music_costume', '号衣装')
    }))
};

export const categories: Category[] = [uniformCategory, costumeCategory]; 