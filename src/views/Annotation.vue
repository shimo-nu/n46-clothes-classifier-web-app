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
    </v-row>

    <!-- Image annotation area -->
    <v-row>
      <v-col cols="12" md="8">
        <div class="image-container" @mousedown="startDrawing" @mousemove="draw" @mouseup="endDrawing">
          <img :src="handleImage" alt="Annotatable Image" class="annotatable-image"/>
          <div
            v-for="(box, index) in boxes"
            :key="index"
            class="bounding-box resizable"
            :style="{ left: box.left + 'px', top: box.top + 'px', width: box.width + 'px', height: box.height + 'px', borderColor: box.color }"
            @mousedown.stop="startDragging(box, $event)"
          >
            <span class="label">{{ box.label }}</span>
            <button class="delete-btn" @click.stop="deleteBox(index)">削除</button>
            <div class="resize-handle" @mousedown.stop.prevent="startResizing(box, $event)"></div>
          </div>
          <div
            v-if="isDrawing"
            class="bounding-box"
            :style="{ left: startX + 'px', top: startY + 'px', width: currentWidth + 'px', height: currentHeight + 'px' }"
          ></div>
        </div>
      </v-col>

      <!-- Annotated Boxes Display -->
      <v-col cols="12" md="4">
        <v-card class="mx-auto" max-width="600">
          <v-card-title>Annotated Boxes</v-card-title>
          <v-list>
            <v-list-item
              v-for="(box, index) in boxes"
              :key="index"
            >
              <v-list-item-content>
                Box {{ index + 1 }}: ({{ box.left }}, {{ box.top }}) - ({{ box.width }}x{{ box.height }}) - Label: {{ box.label }}
                <v-btn small text color="red" @click="deleteBox(index)">削除</v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue';
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
    const isDragging = ref(false);
    const isResizing = ref(false);
    const startX = ref(0);
    const startY = ref(0);
    const currentWidth = ref(0);
    const currentHeight = ref(0);
    const currentBox = ref(null);
    const offsetX = ref(0);
    const offsetY = ref(0);
    const resizeDirection = ref('');
    const labelColorMap = {
      // 制服ラベル用の色（例）
      '1_uniform': '#e6194b', '2_uniform': '#3cb44b', '3_uniform': '#ffe119', '4_uniform': '#4363d8',
      '5_uniform': '#f58231', '6_uniform': '#911eb4', '7_uniform': '#46f0f0', '8_uniform': '#f032e6',
      '9_uniform': '#bcf60c', '10_uniform': '#fabebe', '11_uniform': '#008080', '12_uniform': '#e6beff',
      '13_uniform': '#9a6324', '14_uniform': '#fffac8', '15_uniform': '#800000', '16_uniform': '#aaffc3',
      '17_uniform': '#808000', '18_uniform': '#ffd8b1', '19_uniform': '#000075', '20_uniform': '#808080',
      '21_uniform': '#ffffff', '22_uniform': '#000000', '23_uniform': '#a9a9a9', '24_uniform': '#ffb347',
      '25_uniform': '#b19cd9', '26_uniform': '#77dd77', '27_uniform': '#ff6961', '28_uniform': '#cfcfc4',
      '29_uniform': '#aec6cf', '30_uniform': '#b39eb5', '31_uniform': '#ff7f50', '32_uniform': '#b2fba5',
      '33_uniform': '#ffb347', '34_uniform': '#b19cd9', '35_uniform': '#77dd77',
      // 歌衣装ラベル用の色（例）
      '1_music_costume': '#e6194b', '2_music_costume': '#3cb44b', '3_music_costume': '#ffe119', '4_music_costume': '#4363d8',
      '5_music_costume': '#f58231', '6_music_costume': '#911eb4', '7_music_costume': '#46f0f0', '8_music_costume': '#f032e6',
      '9_music_costume': '#bcf60c', '10_music_costume': '#fabebe', '11_music_costume': '#008080', '12_music_costume': '#e6beff',
      '13_music_costume': '#9a6324', '14_music_costume': '#fffac8', '15_music_costume': '#800000', '16_music_costume': '#aaffc3',
      '17_music_costume': '#808000', '18_music_costume': '#ffd8b1', '19_music_costume': '#000075', '20_music_costume': '#808080',
      '21_music_costume': '#ffffff', '22_music_costume': '#000000', '23_music_costume': '#a9a9a9', '24_music_costume': '#ffb347',
      '25_music_costume': '#b19cd9', '26_music_costume': '#77dd77', '27_music_costume': '#ff6961', '28_music_costume': '#cfcfc4',
      '29_music_costume': '#aec6cf', '30_music_costume': '#b39eb5', '31_music_costume': '#ff7f50', '32_music_costume': '#b2fba5',
      '33_music_costume': '#ffb347', '34_music_costume': '#b19cd9', '35_music_costume': '#77dd77',
      // デフォルト色
      'default': 'red'
    };

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
      if (!isDrawing.value && !isDragging.value && !isResizing.value) {
        isDrawing.value = true;
        startX.value = event.offsetX;
        startY.value = event.offsetY;
      }
    };

    const draw = (event) => {
      if (isDrawing.value) {
        currentWidth.value = event.offsetX - startX.value;
        currentHeight.value = event.offsetY - startY.value;
      } else if (isDragging.value && currentBox.value) {
        currentBox.value.left = event.clientX - offsetX.value;
        currentBox.value.top = event.clientY - offsetY.value;
      } else if (isResizing.value && currentBox.value) {
        if (resizeDirection.value === 'se') {
          currentBox.value.width = Math.max(10, event.clientX - currentBox.value.left);
          currentBox.value.height = Math.max(10, event.clientY - currentBox.value.top);
        }
      }
    };

    const endDrawing = () => {
      if (isDrawing.value) {
        boxes.value.push({
          left: startX.value,
          top: startY.value,
          width: currentWidth.value,
          height: currentHeight.value,
          label: selectedLabel.value,  // 選択されたラベルを追加
          color: labelColorMap[selectedLabel.value] || labelColorMap['default'] // ラベルに応じた色
        });
        isDrawing.value = false;
        currentWidth.value = 0;
        currentHeight.value = 0;
      } else if (isDragging.value) {
        isDragging.value = false;
        currentBox.value = null;
      } else if (isResizing.value) {
        isResizing.value = false;
        currentBox.value = null;
      }
    };

    const startDragging = (box, event) => {
      if (!isResizing.value) {
        isDragging.value = true;
        currentBox.value = box;
        offsetX.value = event.clientX - box.left;
        offsetY.value = event.clientY - box.top;
      }
    };

    const startResizing = (box, event) => {
      isResizing.value = true;
      currentBox.value = box;
      resizeDirection.value = 'se'; // 現在は右下の方向のみサポート
      offsetX.value = event.clientX;
      offsetY.value = event.clientY;
    };

    const deleteBox = (index) => {
      boxes.value.splice(index, 1);
    };

    return {
      labelCategories,
      selectedCategory,
      selectedLabel,
      currentLabels,
      isDrawing,
      isDragging,
      isResizing,
      startX,
      startY,
      currentWidth,
      currentHeight,
      boxes,
      updateLabels,
      startDrawing,
      draw,
      endDrawing,
      startDragging,
      startResizing,
      deleteBox
    };
  }
};
</script>

<style scoped>

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
  user-select: none;
  pointer-events: none;
}

.bounding-box {
  position: absolute;
  border: 2px solid;
  cursor: move;
}

.bounding-box .label {
  position: absolute;
  top: -20px;
  left: 0;
  background-color: white;
  padding: 2px;
  font-size: 12px;
}

.delete-btn {
  position: absolute;
  top: -25px;
  right: 0;
  background: red;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 10px;
}

.bounding-box:hover .delete-btn {
  display: block;
}

.resizable .resize-handle {
  position: absolute;
  width: 6px;
  height: 6px;
  background-color: red;
  border: 1px solid black;
  bottom: -3px;
  right: -3px;
  cursor: se-resize;
}

</style>