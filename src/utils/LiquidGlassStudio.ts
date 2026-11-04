// Liquid Glass Studio — WebGL2 engine
// Based on https://github.com/iyinchao/liquid-glass-studio (MIT License)
// Copyright (c) 2025 Charles Yin (iyinchao)
//
// Apple Liquid Glass: refraction, dispersion, Fresnel reflection, glare.
// Multipass: background -> blur H/V (Gaussian) -> main shader (SDF shape,
// Snell refraction, chromatic dispersion, fresnel, glare).

import { MultiPassRenderer, loadTextureFromURL } from '~/utils/GLUtils'
import VertexShader from '~/shaders/vertex.glsl?raw'
import FragmentBgShader from '~/shaders/fragment-bg.glsl?raw'
import FragmentBgVblurShader from '~/shaders/fragment-bg-vblur.glsl?raw'
import FragmentBgHblurShader from '~/shaders/fragment-bg-hblur.glsl?raw'
import FragmentMainShader from '~/shaders/fragment-main.glsl?raw'

// Verbatim defaults from liquid-glass-studio Controls.tsx
export const LG_CONTROLS = {
  refThickness: 20,
  refDistance: 0.05,
  refFactor: 1.4,
  refDispersion: 7,
  refFresnelRange: 30,
  refFresnelHardness: 20,
  refFresnelFactor: 20,
  glareRange: 30,
  glareHardness: 20,
  glareFactor: 90,
  glareConvergence: 50,
  glareOppositeFactor: 80,
  glareAngle: -45,
  blurRadius: 1,
  blurEdge: true,
  tint: { r: 255, g: 255, b: 255, a: 0 },
  shadowExpand: 25,
  shadowFactor: 15,
  shadowPosition: { x: 0, y: -10 },
  shapeWidth: 200,
  shapeHeight: 200,
  shapeRadius: 80,
  shapeRoundness: 5,
  mergeRate: 0.05,
  showShape1: true,
  springSizeFactor: 10,
  step: 9,
}

export function computeGaussianKernelByRadius(radius: number): number[] {
  const sigma = radius / 3.0
  const kernel: number[] = []
  let sum = 0
  for (let i = 0; i <= radius; i++) {
    const weight = Math.exp((-0.5 * i * i) / (sigma * sigma))
    kernel.push(weight)
    sum += i === 0 ? weight : weight * 2
  }
  return kernel.map((w) => w / sum)
}

export interface LiquidGlassStudioOptions {
  width: number
  height: number
  dpr?: number
  bgImage?: string // image URL for background (bgType image)
  controls?: Partial<typeof LG_CONTROLS>
  mouseFollow?: boolean
}

// Simple spring (replaces @react-spring Controller in the original)
class Spring2D {
  pos = { x: 0, y: 0 }
  vel = { x: 0, y: 0 }
  target = { x: 0, y: 0 }
  speed = { x: 0, y: 0 }
  stiffness = 170
  damping = 22
  mass = 1

  set(target: { x: number; y: number }) {
    this.target = target
  }
  update(dt: number) {
    const prev = { ...this.pos }
    for (const axis of ['x', 'y'] as const) {
      const f = -this.stiffness * (this.pos[axis] - this.target[axis]) - this.damping * this.vel[axis]
      this.vel[axis] += (f / this.mass) * dt
      this.pos[axis] += this.vel[axis] * dt
    }
    this.speed = {
      x: (this.pos.x - prev.x) / Math.max(dt, 1e-4),
      y: (this.pos.y - prev.y) / Math.max(dt, 1e-4),
    }
  }
}

export class LiquidGlassStudio {
  private canvas: HTMLCanvasElement
  private renderer: MultiPassRenderer | null = null
  private opts: LiquidGlassStudioOptions
  private controls: typeof LG_CONTROLS
  private blurWeights: number[]
  private spring = new Spring2D()
  private pointer = { x: 0, y: 0 }
  private bgTexture: WebGLTexture | null = null
  private bgTextureRatio = 1
  private bgTextureReady = false
  private raf = 0
  private lastTime = 0
  private destroyed = false

  constructor(canvas: HTMLCanvasElement, opts: LiquidGlassStudioOptions) {
    this.canvas = canvas
    this.opts = { dpr: Math.min(window.devicePixelRatio || 1, 2), mouseFollow: true, ...opts }
    this.controls = { ...LG_CONTROLS, ...opts.controls }
    this.blurWeights = computeGaussianKernelByRadius(this.controls.blurRadius)
    this.init()
  }

  private init() {
    const gl = this.canvas.getContext('webgl2')
    if (!gl) throw new Error('WebGL2 not supported')

    this.renderer = new MultiPassRenderer(this.canvas, [
      { name: 'bgPass', shader: { vertex: VertexShader, fragment: FragmentBgShader } },
      { name: 'vBlurPass', shader: { vertex: VertexShader, fragment: FragmentBgVblurShader }, inputs: { u_prevPassTexture: 'bgPass' } },
      { name: 'hBlurPass', shader: { vertex: VertexShader, fragment: FragmentBgHblurShader }, inputs: { u_prevPassTexture: 'vBlurPass' } },
      { name: 'mainPass', shader: { vertex: VertexShader, fragment: FragmentMainShader }, inputs: { u_blurredBg: 'hBlurPass', u_bg: 'bgPass' }, outputToScreen: true },
    ])

    const dpr = this.opts.dpr!
    this.canvas.width = this.opts.width * dpr
    this.canvas.height = this.opts.height * dpr
    this.canvas.style.width = this.opts.width + 'px'
    this.canvas.style.height = this.opts.height + 'px'
    gl.viewport(0, 0, Math.round(this.opts.width * dpr), Math.round(this.opts.height * dpr))
    this.renderer.resize(this.opts.width * dpr, this.opts.height * dpr)
    this.renderer.setUniform('u_resolution', [this.opts.width * dpr, this.opts.height * dpr])

    // Mouse tracked in raw pixels, Y flipped (bottom-up) — as in original App.tsx
    this.pointer = { x: (this.opts.width * dpr) / 2, y: (this.opts.height * dpr) / 2 }
    this.spring.pos = { ...this.pointer }
    this.spring.target = { ...this.pointer }

    this.canvas.addEventListener('pointermove', (e) => {
      const r = this.canvas.getBoundingClientRect()
      this.pointer = {
        x: (e.clientX - r.left) * dpr,
        y: (this.opts.height - (e.clientY - r.top)) * dpr,
      }
      this.spring.set(this.pointer)
    })
    this.canvas.addEventListener('pointerleave', () => {
      this.pointer = { x: (this.opts.width * dpr) / 2, y: (this.opts.height * dpr) / 2 }
      this.spring.set(this.pointer)
    })

    // Background image (original: bgType image = 5)
    if (this.opts.bgImage) {
      loadTextureFromURL(gl, this.opts.bgImage).then(({ texture, ratio }) => {
        if (this.destroyed) return
        this.bgTexture = texture
        this.bgTextureRatio = ratio
        this.bgTextureReady = true
      }).catch(() => {})
    }

    this.lastTime = performance.now()
    const loop = () => {
      if (this.destroyed) return
      this.render()
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  private render() {
    if (!this.renderer) return
    const now = performance.now()
    const dt = Math.min((now - this.lastTime) / 1000, 0.05)
    this.lastTime = now
    this.spring.update(dt)

    const dpr = this.opts.dpr!
    const W = this.opts.width * dpr
    const H = this.opts.height * dpr
    const c = this.controls

    const shapeSizeSpring = {
      x: c.shapeWidth + (Math.abs(this.spring.speed.x) * c.shapeWidth * c.springSizeFactor) / 100,
      y: c.shapeHeight + (Math.abs(this.spring.speed.y) * c.shapeHeight * c.springSizeFactor) / 100,
    }

    this.renderer.setUniforms({
      u_resolution: [W, H],
      u_dpr: dpr,
      u_blurWeights: this.blurWeights,
      u_blurRadius: c.blurRadius,
      u_mouse: [this.pointer.x, this.pointer.y],
      u_mouseSpring: [this.spring.pos.x, this.spring.pos.y],
      u_shapeWidth: shapeSizeSpring.x,
      u_shapeHeight: shapeSizeSpring.y,
      u_shapeRadius: ((Math.min(shapeSizeSpring.x, shapeSizeSpring.y) / 2) * c.shapeRadius) / 100,
      u_shapeRoundness: c.shapeRoundness,
      u_mergeRate: c.mergeRate,
      u_glareAngle: (c.glareAngle * Math.PI) / 180,
      u_showShape1: c.showShape1 ? 1 : 0,
    })

    this.renderer.render({
      bgPass: {
        u_bgType: 5, // image background (their bgType image branch)
        u_bgTexture: this.bgTexture ?? undefined,
        u_bgTextureRatio: this.bgTexture ? this.bgTextureRatio : undefined,
        u_bgTextureReady: this.bgTextureReady ? 1 : 0,
        u_shadowExpand: c.shadowExpand,
        u_shadowFactor: c.shadowFactor / 100,
        u_shadowPosition: [-c.shadowPosition.x, -c.shadowPosition.y],
      },
      mainPass: {
        u_tint: [c.tint.r / 255, c.tint.g / 255, c.tint.b / 255, c.tint.a],
        u_refThickness: c.refThickness,
        u_refDistance: c.refDistance,
        u_refFactor: c.refFactor,
        u_refDispersion: c.refDispersion,
        u_refFresnelRange: c.refFresnelRange,
        u_refFresnelHardness: c.refFresnelHardness / 100,
        u_refFresnelFactor: c.refFresnelFactor / 100,
        u_glareRange: c.glareRange,
        u_glareHardness: c.glareHardness / 100,
        u_glareConvergence: c.glareConvergence / 100,
        u_glareOppositeFactor: c.glareOppositeFactor / 100,
        u_glareFactor: c.glareFactor / 100,
        u_blurEdge: c.blurEdge ? 1 : 0,
        STEP: c.step,
      },
    })
  }

  resize(width: number, height: number) {
    this.opts.width = width
    this.opts.height = height
    const dpr = this.opts.dpr!
    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.canvas.style.width = width + 'px'
    this.canvas.style.height = height + 'px'
    const gl = this.canvas.getContext('webgl2')
    if (gl) gl.viewport(0, 0, Math.round(width * dpr), Math.round(height * dpr))
    this.renderer?.resize(width * dpr, height * dpr)
    this.renderer?.setUniform('u_resolution', [width * dpr, height * dpr])
  }

  destroy() {
    this.destroyed = true
    cancelAnimationFrame(this.raf)
    this.renderer?.dispose()
    this.renderer = null
  }
}
