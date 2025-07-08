<template>
  <div class="webcam-component">
    <video ref="videoElement" autoplay  muted playsinline></video>
    <!-- <button @click="startCamera">Start Camera</button>
    <button @click="stopCamera">Stop Camera</button> -->
    <div>
      <label class="inputs">
        UPLOAD IMAGE
        <input
          style="display: none"
          type="file"
          id="input-upload-image"
          @change="handleFileChange"
        />
      </label>
    </div>
    <div v-if="imageUrl">
      <img :src="imageUrl" alt="Uploaded Image" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeUnmount, toRefs} from 'vue';

export default defineComponent({
  name: 'CameraComponent',
  emits: ['image-uploaded'],
  setup(props, { emit }) {
    const videoElement = ref<HTMLVideoElement | null>(null);
    const videoStream = ref<MediaStream | null>(null);
    const imageUrl = ref<string | null>(null);

    const startCamera = async () => {
      // try {
      //   const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      //   videoStream.value = stream;
      //   if (videoElement.value) {
      //     videoElement.value.srcObject = stream;
      //   }
      // } catch (error) {
      //   console.error('Error accessing camera:', error);
      // }
       if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('お使いのブラウザはカメラのアクセスをサポートしていません。');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoStream.value = stream;
        if (videoElement.value) {
          videoElement.value.srcObject = stream;
        }
      } catch (error) {
        console.error('カメラにアクセスできません:', error);
      }
    };

    const stopCamera = () => {
      if (videoStream.value) {
        videoStream.value.getTracks().forEach(track => track.stop());
        videoStream.value = null;
        if (videoElement.value) {
          videoElement.value.srcObject = null;
        }
      }
    };

    const handleFileChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        console.log("image=uploaed");
        reader.onload = (event) => {
          const result = event.target?.result as string;
          // imageUrl.value = result;
          emit('image-uploaded', result);
        };
        reader.readAsDataURL(input.files[0]);
      }
    };

    onBeforeUnmount(() => {
      stopCamera();
    });

    return {
      videoElement,
      startCamera,
      stopCamera,
      handleFileChange,
      ...toRefs({ videoElement, imageUrl }),
    };
  },
});
</script>

<style scoped>
video {
  width: 100%;
  max-width: 400px;
}
button {
  margin: 10px;
}
img {
  max-width: 100%;
  height: auto;
  margin-top: 20px;
}
.inputs {
  margin: auto;
  background: #f5f5f5;
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  align-items: center;
  border-radius: 2px;
  display: inline-flex;
  width: 100%;
  height: 38px;
  font-size: 14px;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1), color 1ms;
  justify-content: center;
  padding: 0 16px;
}

.webcam-component {
  margin:10px;
}
</style>
