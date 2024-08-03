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

    

    const loadModel = async () => {
      console.log("loadModel");
      const response = await fetch(MODEL_FILEPATH);
      const modelFile = await response.arrayBuffer();
      session.value = await runModelUtils.createModelCpu(modelFile)
      await runModelUtils.warmupModel(session.value, [1, 3, 640, 640]);
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
        inputCanvas.value!.width = 640;
        inputCanvas.value!.height = 640;
        const ctx = inputCanvas.value!.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 640, 640);
          const tensor = preprocess(ctx);
          const output = await session.value!.run({ "images": tensor });
          console.log(output);
          await postprocess(output.output0, performance.now());
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
      if (outputContainer.value) {
        outputContainer.value.innerHTML = '';
      }

      console.log(tensor);

      const originalOutput = new Tensor('float32', tensor.data as Float32Array, [1, 125, 13, 13]);
      const outputTensor = yoloTransforms.transpose(originalOutput, [0, 2, 3, 1]);

      const boxes = await yolo.postprocess(outputTensor, 20);
      boxes.forEach((box) => {
        const { top, left, bottom, right, classProb, className } = box;
         const webcamContainerElement = document.getElementById("webcam-container") as HTMLElement;
        // Depending on the display size, webcamContainerElement might be smaller than 640x640.
        var [ox, oy] = [(webcamContainerElement.offsetWidth - 640) / 2, (webcamContainerElement.offsetHeight - 640) / 2];
        console.log(ox, oy);
        ox = 0;
        oy = 0;
        drawRect(
          left - ox, 
          top - oy,
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
