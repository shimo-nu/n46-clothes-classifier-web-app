<template>
  <div id="app">
    <h1>Camera and Image Upload Example</h1>
    <CameraComponent @image-uploaded="handleImageUploaded"/>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Tensor, InferenceSession } from 'onnxruntime-web';
import ndarray from 'ndarray';
import ops from 'ndarray-ops';
import { runModelUtils, yolo, yoloTransforms } from '../utils/index';
import CameraComponent from '../components/common/WebcamUI.vue';
// import {NumberDataType, Type} from '../utils/utils-yolo/yoloPostprocess.ts';



const MODEL_FILEPATH = './data/best.onnx';

export function arrayCopyHelper(
    target: NumberDataType, source: NumberDataType, targetIndex: number, sourceIndex: number, blockSize: number) {
  if (sourceIndex < 0 || sourceIndex >= source.length) {
    throw new Error(`sourceIndex out of bounds`);
  }
  if (targetIndex < 0 || targetIndex >= target.length) {
    throw new Error(`targetIndex out of bounds`);
  }
  if (sourceIndex + blockSize > source.length) {
    throw new Error(`source indices to be copied are outside bounds`);
  }
  if (targetIndex + blockSize > target.length) {
    throw new Error(`target array is too small to hold result`);
  }

  for (let offset = 0; offset < blockSize; offset++) {
    target[targetIndex + offset] = source[sourceIndex + offset];
  }
}

export default defineComponent({
  name: 'App',
  components: {
    CameraComponent,
  },
  setup() {
    const inputCanvas = ref<HTMLCanvasElement | null>(null);
    const outputContainer = ref<HTMLDivElement | null>(null);
    const session = ref<InferenceSession | null>(null);

    const loadModel = async () => {
      session.value = await InferenceSession.create(MODEL_FILEPATH);
      await runModelUtils.warmupModel(session.value, [1, 3, 416, 416]);
    };

    const handleImageUploaded = async (imageData: string) => {
      if (!inputCanvas.value || !session.value) return;

      // Load the image into the canvas
      const img = new Image();
      img.onload = async () => {
        inputCanvas.value!.width = 416;
        inputCanvas.value!.height = 416;
        const ctx = inputCanvas.value!.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 416, 416);
          const tensor = preprocess(ctx);
          console.log(tensor)
          // const output = await session.value!.run({ input: tensor });
          // await postprocess(output.output, performance.now());
        }
      };
      img.src = imageData;
    };


    const preprocess = (ctx: CanvasRenderingContext2D): Tensor => {
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      const { data, width, height } = imageData;

      const dataTensor = ndarray(new Float32Array(data), [width, height, 4]);
      const dataProcessedTensor = ndarray(new Float32Array(width * height * 3), [
        1,
        3,
        width,
        height,
      ]);

      ops.assign(dataProcessedTensor.pick(0, 0, null, null), dataTensor.pick(null, null, 0));
      ops.assign(dataProcessedTensor.pick(0, 1, null, null), dataTensor.pick(null, null, 1));
      ops.assign(dataProcessedTensor.pick(0, 2, null, null), dataTensor.pick(null, null, 2));

      const tensor = new Tensor('float32', new Float32Array(width * height * 3), [
        1,
        3,
        width,
        height,
      ]);
      (tensor.data as Float32Array).set(dataProcessedTensor.data);
      return tensor;
    };

    const postprocess = async (tensor: Tensor, inferenceTime: number) => {
      const originalOutput = new Tensor('float32', tensor.data as Float32Array, [1, 125, 13, 13]);
      const outputTensor = yoloTransforms.transpose(originalOutput, [0, 2, 3, 1]);

      const boxes = await yolo.postprocess(outputTensor, 20);
      boxes.forEach((box) => {
        const { top, left, bottom, right, classProb, className } = box;
        drawRect(
          left,
          top,
          right - left,
          bottom - top,
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
</style>
