<template>
  <v-container class="annotation-tool">
    <v-row>
      <!-- 選択された画像とラベルクラスを表示 -->
      <v-col cols="12" md="6">
        <v-card class="mx-auto" max-width="400">
          <v-img :src="handleImage" alt="Annotatable Image"></v-img>
          <v-card-title>Image Annotation</v-card-title>
          <v-card-subtitle>
            カテゴリ: {{ labelCategoryName }}
          </v-card-subtitle>
        </v-card>
      </v-col>

      <!-- ラベルの種類を選択するセレクション -->
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedCategory"
          :items="Object.keys(labelCategories)"
          label="ラベルの種類を選択"
          @change="updateLabels"
        ></v-select>
      </v-col>

      <!-- ラベルセレクション -->
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedLabel"
          :items="currentLabels"
          label="ラベルを選択"
        ></v-select>
      </v-col>

      <!-- Annotated Boxes Display -->
      <v-col cols="12">
        <v-card class="mx-auto" max-width="600">
          <v-card-title>Annotated Boxes</v-card-title>
          <v-list>
            <v-list-item
              v-for="(box, index) in boxes"
              :key="index"
            >
              <v-list-item-content>
                Box {{ index + 1 }}: ({{ box.left }}, {{ box.top }}) - ({{ box.width }}x{{ box.height }}) - Label: {{ box.label }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Image annotation area -->
    <v-row>
      <v-col cols="12">
        <div class="image-container" @mousedown="startDrawing" @mousemove="draw" @mouseup="endDrawing">
          <img :src="handleImage" alt="Annotatable Image" class="annotatable-image"/>
          <div
            v-for="(box, index) in boxes"
            :key="index"
            class="bounding-box"
            :style="{ left: box.left + 'px', top: box.top + 'px', width: box.width + 'px', height: box.height + 'px' }"
          >
            <span class="label">{{ box.label }}</span>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>



<script>
import { ref, onMounted, watch } from 'vue';
import { uniform, music_costume } from '../data/yolo_classes';

export default {
  props: {
    handleImage: {
      type: String,
      required: true
    },
    labelCategoryName: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const selectedCategory = ref('');  // 選択されたラベルカテゴリー
    const currentLabels = ref([]);  // 現在のラベルリスト
    const selectedLabel = ref('');  // 選択されたラベル
    const labelCategories = {
      '制服識別': uniform,
      '歌衣装識別': music_costume
    };
    const boxes = ref([]);  // 描画されたボックス
    const isDrawing = ref(false);
    const startX = ref(0);
    const startY = ref(0);
    const currentWidth = ref(0);
    const currentHeight = ref(0);

    onMounted(() => {
      if (props.labelCategoryName && props.handleImage) {
        if (props.labelCategoryName == "制服識別") {
          selectedCategory.value = "制服識別";
          currentLabels.value = uniform;
          selectedLabel.value = currentLabels.value.length > 0 ? currentLabels.value[0] : '';
        } else if (props.labelCategoryName == "歌衣装識別") {
          selectedCategory.value = "歌衣装識別"; 
          currentLabels.value = music_costume;
          selectedLabel.value = currentLabels.value.length > 0 ? currentLabels.value[0] : '';
        }
      } else {
        console.error('ラベルカテゴリーが存在しません。');
      }
    });

    const updateLabels = () => {
      // selectedCategoryに基づいてラベルリストを更新
      if (selectedCategory.value === '制服識別') {
        currentLabels.value = uniform;
        selectedLabel.value = currentLabels.value.length > 0 ? currentLabels.value[0] : '';
      } else if (selectedCategory.value === '歌衣装識別') {
        currentLabels.value = music_costume;
        selectedLabel.value = currentLabels.value.length > 0 ? currentLabels.value[0] : '';
      } else {
        currentLabels.value = [];
        selectedLabel.value = '';
        console.error('選択されたラベルカテゴリーが存在しません。');
      }
    };


    const startDrawing = (event) => {
      if (!isDrawing.value) {
        isDrawing.value = true;
        startX.value = event.offsetX;
        startY.value = event.offsetY;
      }
    };

    const draw = (event) => {
      if (isDrawing.value) {
        currentWidth.value = event.offsetX - startX.value;
        currentHeight.value = event.offsetY - startY.value;
      }
    };

    const endDrawing = () => {
      if (isDrawing.value) {
        boxes.value.push({
          left: startX.value,
          top: startY.value,
          width: currentWidth.value,
          height: currentHeight.value,
          label: selectedLabel.value  // 選択されたラベルを追加
        });
        isDrawing.value = false;
        currentWidth.value = 0;
        currentHeight.value = 0;
      }
    };

    return {
      labelCategories,
      selectedCategory,
      selectedLabel,
      currentLabels,
      isDrawing,
      startX,
      startY,
      currentWidth,
      currentHeight,
      boxes,
      updateLabels,
      startDrawing,
      draw,
      endDrawing
    };
  }
};
</script>

<style scoped>
/* .annotation-tool {
  display: flex;
  justify-content: space-between;
}

.image-container {
  position: relative;
  display: inline-block;
}

.image-container img {
  max-width: 500px;
  border: 1px solid #ccc;
}

.bounding-box {
  position: absolute;
  border: 2px solid red;
  pointer-events: none;
}

.bounding-box .label {
  position: absolute;
  top: -20px;
  left: 0;
  background-color: white;
  padding: 2px;
  font-size: 12px;
}

.annotations {
  margin-left: 20px;
}

.annotations ul {
  list-style: none;
  padding: 0;
}

.annotations ul li {
  margin-bottom: 5px;
} */

.annotation-tool {
  padding: 20px;
}

.image-container {
  position: relative;
  display: inline-block;
  border: 2px solid #ccc;
}

.annotatable-image {
  max-width: 100%;
}

.bounding-box {
  position: absolute;
  border: 2px solid red;
  pointer-events: none;
}

.bounding-box .label {
  position: absolute;
  top: -20px;
  left: 0;
  background-color: white;
  padding: 2px;
  font-size: 12px;
}

</style>
