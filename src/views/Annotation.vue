<template>
  <v-container class="annotation-tool">
    <v-alert
      v-if="!isAuthenticated"
      color="warning"
      text
      class="mb-4"
    >
      アノテーションを送信するにはログインが必要です。
      <v-btn
        color="warning"
        class="ml-4"
        @click="loginWithRedirect"
      >
        ログイン
      </v-btn>
    </v-alert>

    <v-alert
      v-else
      color="success"
      text
      class="mb-4"
    >
      {{ user?.name }}としてログイン中
    </v-alert>

    <v-row v-if="isNewAnnotation">
      <v-col cols="12">
        <v-card class="mx-auto" max-width="600">
          <v-card-title>新規画像アップロード</v-card-title>
          <v-card-text>
            <div class="upload-area" 
                 @dragover.prevent 
                 @drop.prevent="handleFileDrop"
                 :class="{ 'dragging': isDragging }">
              <input
                type="file"
                ref="fileInput"
                @change="handleFileSelect"
                accept="image/*"
                style="display: none"
              />
              <div class="upload-content">
                <v-icon size="48" color="primary">mdi-cloud-upload</v-icon>
                <p>画像をドラッグ＆ドロップするか、クリックして選択してください</p>
                <v-btn color="primary" @click="$refs.fileInput.click()">
                  ファイルを選択
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="!isNewAnnotation || (isNewAnnotation && uploadedImage)">
      <v-col cols="12" md="6">
        <v-card class="mx-auto" max-width="400">
          <v-img :src="displayImage" alt="Annotatable Image"></v-img>
          <v-card-title>Image Annotation</v-card-title>
          <v-card-subtitle>
            カテゴリ: {{ labelCategoryName }}
          </v-card-subtitle>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-select
          v-model="selectedCategory"
          :items="Object.keys(labelCategories)"
          label="ラベルの種類を選択"
          @change="updateLabels"
        ></v-select>
      </v-col>

      <v-col cols="12" md="6">
        <v-select
          v-model="selectedLabel"
          :items="currentLabels"
          label="ラベルを選択"
        ></v-select>
      </v-col>
    </v-row>

    <v-row v-if="!isNewAnnotation || (isNewAnnotation && uploadedImage)">
      <v-col cols="12" md="8">
        <div class="image-container" @mousedown="startDrawing" @mousemove="draw" @mouseup="endDrawing" @mouseleave="endDrawing">
          <img :src="displayImage" alt="Annotatable Image" class="annotatable-image"/>
          <template v-for="(box, index) in boxes" :key="index">
            <div
              :class="['bounding-box', { 'resizable': true, 'selected': box === selectedBox }]"
              :style="{ 
                left: box.left + 'px', 
                top: box.top + 'px', 
                width: box.width + 'px', 
                height: box.height + 'px', 
                borderColor: box.color
              }"
              @mousedown.stop="startDragging(box, $event)"
            >
              <div class="label-container">
                <span class="label">{{ box.label }}</span>
              </div>
              <button class="delete-btn" @click.stop="deleteBox(index)">×</button>
              <div class="resize-handle" @mousedown.stop.prevent="startResizing(box, $event)"></div>
            </div>
          </template>
          <div
            v-if="isDrawing"
            class="bounding-box"
            :style="{ left: startX + 'px', top: startY + 'px', width: currentWidth + 'px', height: currentHeight + 'px' }"
          ></div>
        </div>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="mx-auto" max-width="600">
          <v-card-title>Annotated Boxes</v-card-title>
          <v-list>
            <v-list-item
              v-for="(box, index) in boxes"
              :key="index"
            >
              <v-list-item-content>
                Box {{ index + 1 }}: ({{ Math.round(box.left) }}, {{ Math.round(box.top) }}) - ({{ Math.round(box.width) }}x{{ Math.round(box.height) }}) - Label: {{ box.label }}
                <v-btn small text color="red" @click="deleteBox(index)">削除</v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-btn 
            color="primary" 
            @click="submitAnnotations"
            :loading="isSubmitting"
            :disabled="isSubmitting || !isAuthenticated"
          >
            {{ isSubmitting ? '送信中...' : '送信' }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { uniform, music_costume } from '../data/yolo_classes';
import { ENDPOINTS } from '../api/endpoints';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-vue';

export default {
  props: {
    handleImage: {
      type: String,
      required: true
    },
    labelCategoryName: {
      type: String,
      required: true
    },
    isNewAnnotation: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { getAccessTokenSilently, loginWithRedirect, isAuthenticated, user } = useAuth0();
    const selectedCategory = ref('');
    const currentLabels = ref([]);
    const selectedLabel = ref('');
    const isSubmitting = ref(false);
    const labelCategories = {
      '制服識別': uniform,
      '歌衣装識別': music_costume
    };
    const boxes = ref([]);
    const isDrawing = ref(false);
    const isDragging = ref(false);
    const isResizing = ref(false);
    const startX = ref(0);
    const startY = ref(0);
    const currentWidth = ref(0);
    const currentHeight = ref(0);
    const currentBox = ref(null);
    const selectedBox = ref(null);
    const offsetX = ref(0);
    const offsetY = ref(0);
    const resizeDirection = ref('');
    const uploadedImage = ref(null);
    const isDraggingFile = ref(false);
    const tempBox = ref({ left: 0, top: 0, width: 0, height: 0 });
    const resizeStartX = ref(0);
    const resizeStartY = ref(0);
    const copiedBox = ref(null);

    const displayImage = computed(() => {
      return props.isNewAnnotation ? uploadedImage.value : props.handleImage;
    });

    const labelColorMap = {
      '1_uniform': '#e6194b', '2_uniform': '#3cb44b', '3_uniform': '#ffe119', '4_uniform': '#4363d8',
      '5_uniform': '#f58231', '6_uniform': '#911eb4', '7_uniform': '#46f0f0', '8_uniform': '#f032e6',
      '9_uniform': '#bcf60c', '10_uniform': '#fabebe', '11_uniform': '#008080', '12_uniform': '#e6beff',
      '13_uniform': '#9a6324', '14_uniform': '#fffac8', '15_uniform': '#800000', '16_uniform': '#aaffc3',
      '17_uniform': '#808000', '18_uniform': '#ffd8b1', '19_uniform': '#000075', '20_uniform': '#808080',
      '21_uniform': '#ffffff', '22_uniform': '#000000', '23_uniform': '#a9a9a9', '24_uniform': '#ffb347',
      '25_uniform': '#b19cd9', '26_uniform': '#77dd77', '27_uniform': '#ff6961', '28_uniform': '#cfcfc4',
      '29_uniform': '#aec6cf', '30_uniform': '#b39eb5', '31_uniform': '#ff7f50', '32_uniform': '#b2fba5',
      '33_uniform': '#ffb347', '34_uniform': '#b19cd9', '35_uniform': '#77dd77',
      // 歌衣装ラベル用の色
      '1_music_costume': '#e6194b', '2_music_costume': '#3cb44b', '3_music_costume': '#ffe119', '4_music_costume': '#4363d8',
      '5_music_costume': '#f58231', '6_music_costume': '#911eb4', '7_music_costume': '#46f0f0', '8_music_costume': '#f032e6',
      '9_music_costume': '#bcf60c', '10_music_costume': '#fabebe', '11_music_costume': '#008080', '12_music_costume': '#e6beff',
      '13_music_costume': '#9a6324', '14_music_costume': '#fffac8', '15_music_costume': '#800000', '16_music_costume': '#aaffc3',
      '17_music_costume': '#808000', '18_music_costume': '#ffd8b1', '19_music_costume': '#000075', '20_music_costume': '#808080',
      '21_music_costume': '#ffffff', '22_music_costume': '#000000', '23_music_costume': '#a9a9a9', '24_music_costume': '#ffb347',
      '25_music_costume': '#b19cd9', '26_music_costume': '#77dd77', '27_music_costume': '#ff6961', '28_music_costume': '#cfcfc4',
      '29_music_costume': '#aec6cf', '30_music_costume': '#b39eb5', '31_music_costume': '#ff7f50', '32_music_costume': '#b2fba5',
      '33_music_costume': '#ffb347', '34_music_costume': '#b19cd9', '35_music_costume': '#77dd77',
      'default': 'red'
    };

    const handleCopy = () => {
      if (selectedBox.value) {
        copiedBox.value = { ...selectedBox.value };
      }
    };

    const handlePaste = () => {
      if (copiedBox.value) {
        const newBox = {
          ...copiedBox.value,
          left: copiedBox.value.left + 10,
          top: copiedBox.value.top + 10,
        };
        boxes.value.push(newBox);
        selectedBox.value = newBox;
      }
    };

    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'c') {
        handleCopy();
      }
      if (event.ctrlKey && event.key === 'v') {
        handlePaste();
      }
    };

    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown);
      if (props.isNewAnnotation) {
        selectedCategory.value = "制服識別";
        currentLabels.value = uniform;
        selectedLabel.value = currentLabels.value.length > 0 ? currentLabels.value[0] : '';
      } else if (props.labelCategoryName && props.handleImage) {
        if (props.labelCategoryName === "制服識別") {
          selectedCategory.value = "制服識別";
          currentLabels.value = uniform;
          selectedLabel.value = currentLabels.value.length > 0 ? currentLabels.value[0] : '';
        } else if (props.labelCategoryName === "歌衣装識別") {
          selectedCategory.value = "歌衣装識別";
          currentLabels.value = music_costume;
          selectedLabel.value = currentLabels.value.length > 0 ? currentLabels.value[0] : '';
        }
      }
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown);
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
      }
    };

    const startDrawing = (event) => {
      selectedBox.value = null;
      if (!isDrawing.value && !isDragging.value && !isResizing.value) {
        const rect = event.target.getBoundingClientRect();
        isDrawing.value = true;
        startX.value = event.clientX - rect.left;
        startY.value = event.clientY - rect.top;
      }
    };

    const draw = (event) => {
      if (isDrawing.value) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        currentWidth.value = Math.max(10, Math.min(x - startX.value, rect.width - startX.value));
        currentHeight.value = Math.max(10, Math.min(y - startY.value, rect.height - startY.value));
      } else if (isDragging.value && currentBox.value) {
        const rect = event.target.closest('.image-container').getBoundingClientRect();
        const x = event.clientX - resizeStartX.value;
        const y = event.clientY - resizeStartY.value;
        
        const newLeft = x - offsetX.value;
        const newTop = y - offsetY.value;
        
        const containerWidth = rect.width;
        const containerHeight = rect.height;
        currentBox.value.left = Math.max(0, Math.min(newLeft, containerWidth - currentBox.value.width));
        currentBox.value.top = Math.max(0, Math.min(newTop, containerHeight - currentBox.value.height));
      } else if (isResizing.value && currentBox.value) {
        const rect = event.target.closest('.image-container').getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (resizeDirection.value === 'se') {
          const newWidth = Math.max(10, Math.min(x - currentBox.value.left, rect.width - currentBox.value.left));
          const newHeight = Math.max(10, Math.min(y - currentBox.value.top, rect.height - currentBox.value.top));
          
          currentBox.value.width = newWidth;
          currentBox.value.height = newHeight;
        }
      }
    };

    const endDrawing = () => {
      if (isDrawing.value) {
        const newBox = {
          left: Math.round(startX.value),
          top: Math.round(startY.value),
          width: Math.round(currentWidth.value),
          height: Math.round(currentHeight.value),
          label: selectedLabel.value,
          color: labelColorMap[selectedLabel.value] || labelColorMap['default']
        };
        boxes.value.push(newBox);
        selectedBox.value = newBox;
        isDrawing.value = false;
        currentWidth.value = 0;
        currentHeight.value = 0;
      } else if (isDragging.value) {
        if (currentBox.value) {
          currentBox.value.left = Math.round(currentBox.value.left);
          currentBox.value.top = Math.round(currentBox.value.top);
        }
        isDragging.value = false;
        currentBox.value = null;
        } else if (isResizing.value) {
          if (currentBox.value) {
            currentBox.value.width = Math.round(currentBox.value.width);
            currentBox.value.height = Math.round(currentBox.value.height);
          }
          isResizing.value = false;
          currentBox.value = null;
      }
    };

    const startDragging = (box, event) => {
      if (!isResizing.value) {
        selectedBox.value = box;
        const rect = event.target.closest('.image-container').getBoundingClientRect();
        isDragging.value = true;
        currentBox.value = box;
        resizeStartX.value = rect.left;
        resizeStartY.value = rect.top;
        offsetX.value = event.clientX - (rect.left + box.left);
        offsetY.value = event.clientY - (rect.top + box.top);
      }
    };

    const startResizing = (box, event) => {
      event.preventDefault();
      event.stopPropagation();
      selectedBox.value = box;
      isResizing.value = true;
      currentBox.value = box;
      resizeDirection.value = 'se';
    };

    const deleteBox = (index) => {
      if (boxes.value[index] === selectedBox.value) {
        selectedBox.value = null;
      }
      boxes.value.splice(index, 1);
    };

    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedImage.value = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const handleFileDrop = (event) => {
      isDraggingFile.value = false;
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedImage.value = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const submitAnnotations = async () => {
      if (isSubmitting.value) return;
      
      if (!isAuthenticated.value) {
        alert('ログインが必要です');
        await loginWithRedirect({
          appState: { returnTo: window.location.pathname }
        });
        return;
      }
      
      isSubmitting.value = true;
      try {
        if (!boxes.value.length) {
          alert('少なくとも1つのバウンディングボックスを作成してください。');
          return;
        }

        const token = await getAccessTokenSilently();
        if (!token) {
          throw new Error('認証トークンが取得できませんでした。再度ログインしてください。');
        }

        const imageData = props.isNewAnnotation ? uploadedImage.value : props.handleImage;

        const selectedLabels = boxes.value.map(box => box.label);
        const subcategoryIds = [...new Set(selectedLabels.map(label => {
          const match = label.match(/^(\d+)_/);
          return match ? parseInt(match[1]) : null;
        }))].filter(id => id !== null);

        const payload = {
          image: imageData,
          subcategoryIds: subcategoryIds,
          boxes: boxes.value.map(box => ({
            left: Math.round(box.left),
            top: Math.round(box.top),
            width: Math.round(box.width),
            height: Math.round(box.height),
            label: box.label,
            color: box.color
          }))
        };

        const response = await axios.post(ENDPOINTS.ANNOTATIONS, payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Response:', response.status, response.statusText);
        alert('送信が完了しました');
      } catch (error) {
        console.error('Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.response?.data?.message,
          url: ENDPOINTS.ANNOTATIONS
        });

        if (error.response?.status === 403) {
          alert('アクセス権限がありません。再度ログインしてください。');
        } else if (error.response?.status === 401) {
          alert('認証エラーが発生しました。再度ログインしてください。');
        } else if (error.code === 'ERR_NETWORK') {
          alert('ネットワークエラーが発生しました。インターネット接続を確認してください。');
        } else {
          alert('送信に失敗しました: ' + (error.response?.data?.message || error.message || '不明なエラー'));
        }
      } finally {
        isSubmitting.value = false;
      }
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
      uploadedImage,
      isDraggingFile,
      displayImage,
      labelColorMap,
      updateLabels,
      startDrawing,
      draw,
      endDrawing,
      startDragging,
      startResizing,
      deleteBox,
      submitAnnotations,
      handleFileSelect,
      handleFileDrop,
      resizeStartX,
      resizeStartY,
      tempBox,
      currentBox,
      selectedBox,
      isAuthenticated,
      user,
      loginWithRedirect,
      isSubmitting
    };
  }
};
</script>

<style scoped>
.annotation-tool {
  padding: 20px;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area.dragging {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.1);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
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

.bounding-box.selected {
  box-shadow: 0 0 5px 3px rgba(255, 255, 0, 0.7);
}

.label-container {
  position: absolute;
  top: -24px;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 2px 8px;
  border-radius: 4px 4px 4px 0;
  white-space: nowrap;
  z-index: 1;
}

.label {
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
}

.delete-btn {
  position: absolute;
  top: -24px;
  right: -12px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.delete-btn:hover {
  background: #ff0000;
}

.bounding-box:hover .delete-btn {
  display: flex;
}

.resizable .resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: white;
  border: 2px solid #ff4444;
  border-radius: 50%;
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
  z-index: 2;
}

.bounding-box.is-resizing {
  opacity: 0.8;
}

.bounding-box.is-resizing .resize-handle {
  display: none;
}

.v-list-item.updating {
  background-color: rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
}

.v-list-item-content {
  transition: opacity 0.2s ease;
}
</style>