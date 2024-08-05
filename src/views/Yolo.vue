<template>
  <div id="app">
    <h1>Camera and Image Upload Example</h1>
    <CameraComponent @image-uploaded="handleImageUploaded"/>
    <div ref="webcam-container" id="webcam-container" style="position: relative;">
      <canvas ref="inputCanvas" id="inputCanvas"></canvas>
      <div ref="outputContainer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"></div>
    </div>
  </div>
</template>


<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { Tensor, InferenceSession } from 'onnxruntime-web';
import ndarray from 'ndarray';
import ops from 'ndarray-ops';
import { runModelUtils, yolo, yoloTransforms } from '../utils/index';
import CameraComponent from '../components/common/WebcamUI.vue';


const MODEL_FILEPATH = '/data/best.onnx';

export default defineComponent({
  name: 'App',
  components: {
    CameraComponent,
  },
  setup() {
    const inputCanvas = ref<HTMLCanvasElement | null>(null);
    const outputContainer = ref<HTMLDivElement | null>(null);
    var session = ref<InferenceSession | null>(null);

    const image_org_width = 640;
    const image_org_height = 640;

    

    const loadModel = async () => {
      console.log("loadModel");
      const response = await fetch(MODEL_FILEPATH);
      const modelFile = await response.arrayBuffer();
      session.value = await runModelUtils.createModelCpu(modelFile)
      await runModelUtils.warmupModel(session.value, [1, 3, image_org_width, image_org_height]);
      console.log(session.value);
    };

    onMounted(() => {
      console.log("onMounted");
      // inputCanvas.value = document.createElement('canvas');
      // outputContainer.value = document.createElement('div');
      // document.body.appendChild(inputCanvas.value);
      // document.body.appendChild(outputContainer.value);
    });

    const handleImageUploaded = async (imageData: string) => {
      console.log("image uploaded");
      if (!session.value) {
        console.log("session.value is null");
          return;
      }
      console.log("process start");
      // Load the image into the canvas
      const img = new Image();
      img.onload = async () => {
        console.log("image loaded");
        inputCanvas.value!.width = image_org_width;
        inputCanvas.value!.height = image_org_height;
        const ctx = inputCanvas.value!.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, image_org_width, image_org_height);
          const tensor = preprocess(ctx);
          console.log(tensor);
          const output = await session.value!.run({ "images": tensor });
          // const output = await session.value!.run({ "image": tensor });
          console.log(output);
          // await postprocess(output.grid, performance.now());
          await postprocess(output.output0, performance.now());
        }
      };
      img.src = imageData;
    };

  
    const preprocess = (ctx: CanvasRenderingContext2D): Tensor => {
      console.log("preprocess");
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      const { data, width, height } = imageData;

      const resizedData = data;
      const dataTensor = ndarray(new Float32Array(width * height * 3), [width, height, 3]);
      for (let i = 0; i < resizedData.length; i += 4) {
        const r = resizedData[i] / 255.0;
        const g = resizedData[i + 1] / 255.0;
        const b = resizedData[i + 2] / 255.0;
        // const r = resizedData[i];
        // const g = resizedData[i + 1];
        // const b = resizedData[i + 2];

        const index = i / 4;
        const row = Math.floor(index / width);
        const col = index % width;

        dataTensor.set(row, col, 0, r);
        dataTensor.set(row, col, 1, g);
        dataTensor.set(row, col, 2, b);
      }

      const transposedData = ndarray(new Float32Array(width * height * 3), [1, 3, height, width]);
      ops.assign(transposedData.pick(0, 0, null, null), dataTensor.pick(null, null, 0));
      ops.assign(transposedData.pick(0, 1, null, null), dataTensor.pick(null, null, 1));
      ops.assign(transposedData.pick(0, 2, null, null), dataTensor.pick(null, null, 2));

      return new Tensor('float32', transposedData.data, [1, 3, height, width]);
    };

    const postprocess = async (tensor: Tensor, inferenceTime: number) => {
      if (outputContainer.value) {
        outputContainer.value.innerHTML = '';
      }

      console.log(tensor);

      const originalOutput = new Tensor('float32', tensor.data as Float32Array, [1, 39, 8400]);
      // const originalOutput = new Tensor('float32', tensor.data as Float32Array, [1, 125, 13, 13]);
      // const outputTensor = yoloTransforms.transpose(originalOutput, [0, 2, 1]);

      // Tensorのデータを抽出
      const tensorData = originalOutput.data as Float32Array;
      const tensorDims = originalOutput.dims;

      // JSON形式に変換
      const tensorJson = {
        data: Array.from(tensorData),  // Float32Arrayを通常の配列に変換
        dims: tensorDims,
      };

      const blob = new Blob([JSON.stringify(tensorJson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // 仮想的なリンクを作成してユーザーにダウンロードさせる
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tensor_output.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      const boxes = await yolo.postprocess(originalOutput, 35);
      boxes.forEach((box) => {
        const { top, left, width, height, classProb, className } = box;
         const webcamContainerElement = document.getElementById("webcam-container") as HTMLElement;
        // Depending on the display size, webcamContainerElement might be smaller than 416x416.
        var [ox, oy] = [(webcamContainerElement.offsetWidth - image_org_width) / 2, (webcamContainerElement.offsetHeight - image_org_height) / 2]
        console.log(top, left, width, height, classProb, className);
        // ox = 0;
        // oy = 0;
        // console.log(left-ox, top-oy, right-left, bottom-top);
        drawRect(
          left, 
          top,
          width,
          height,
          `${className} Confidence: ${Math.round(classProb * 100)}% Time: ${inferenceTime.toFixed(1)}ms`
        );
      });
    };

    const drawRect = (x: number, y: number, w: number, h: number, text = '', color = 'red') => {
      const rect = document.createElement('div');
      rect.style.cssText = `position: absolute; top: ${y}px; left: ${x}px; width: ${w}px; height: ${h}px; border: 2px solid ${color};`;
      const label = document.createElement('div');
      label.innerText = text;
      label.style.cssText = 'background: rgba(255, 255, 255, 0.5); padding: 2px; font-size: 10px;';
      rect.appendChild(label);
      outputContainer.value!.appendChild(rect);
    };

    loadModel();

    return {
      handleImageUploaded,
      inputCanvas,
      outputContainer,
    };
  },
});
</script>

<style>
#webcam-container {
  position: relative;
}

#inputCanvas {
  z-index: 1;
}

[ref="outputContainer"] {
  z-index: 2;
}

</style>
