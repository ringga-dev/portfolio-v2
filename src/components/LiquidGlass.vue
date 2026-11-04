<template>
  <div class="relative overflow-hidden rounded-[28px]" :style="{ width: width + 'px', height: height + 'px' }">
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full block" />
    <div v-if="$slots.default" class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { LiquidGlassStudio } from '~/utils/LiquidGlassStudio'

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  shapeWidth: { type: Number, default: 200 },
  shapeHeight: { type: Number, default: 200 },
  shapeRadius: { type: Number, default: 80 },
  shapeRoundness: { type: Number, default: 5 },
  bgImage: { type: String, default: 'https://picsum.photos/id/1018/1200/600' },
})

const canvasRef = ref(null)
let engine = null

function createEngine() {
  if (engine) engine.destroy()
  engine = new LiquidGlassStudio(canvasRef.value, {
    width: props.width,
    height: props.height,
    bgImage: props.bgImage,
    controls: {
      shapeWidth: props.shapeWidth,
      shapeHeight: props.shapeHeight,
      shapeRadius: props.shapeRadius,
      shapeRoundness: props.shapeRoundness,
    },
  })
}

onMounted(createEngine)

watch(() => [props.width, props.height], ([w, h]) => {
  if (engine) engine.resize(w, h)
})

onBeforeUnmount(() => {
  if (engine) engine.destroy()
})
</script>