<template>
  <div class="relative overflow-hidden" :style="{ width: width + 'px', height: height + 'px' }">
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full" />
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { LiquidGlass } from '~/liquidGlassEngine'

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  shapeWidth: { type: Number, default: 400 },
  shapeHeight: { type: Number, default: 200 },
  shapeRadius: { type: Number, default: 60 },
  shapeRoundness: { type: Number, default: 4 },
  mouseFollow: { type: Boolean, default: true },
})

const canvasRef = ref(null)
let engine = null

onMounted(() => {
  const checkTheme = () => document.documentElement.getAttribute('data-theme') === 'dark'
  engine = new LiquidGlass(canvasRef.value, {
    width: props.width,
    height: props.height,
    shapeWidth: props.shapeWidth,
    shapeHeight: props.shapeHeight,
    shapeRadius: props.shapeRadius,
    shapeRoundness: props.shapeRoundness,
    mouseFollow: props.mouseFollow,
    dark: checkTheme(),
  })
  // Watch theme changes
  const observer = new MutationObserver(() => {
    if (engine) engine.setTheme(checkTheme())
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})

onBeforeUnmount(() => {
  if (engine) engine.destroy()
})
</script>