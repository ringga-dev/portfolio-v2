// Liquid Glass WebGL2 engine — adapted from
// https://github.com/iyinchao/liquid-glass-studio (MIT)
// Multipass: background -> blur H/V -> main (refraction, dispersion, fresnel, glare)

export interface LiquidGlassOptions {
  width: number
  height: number
  dpr?: number
  dark?: boolean
  shapeWidth?: number
  shapeHeight?: number
  shapeRadius?: number
  shapeRoundness?: number
  mouseFollow?: boolean
}

const VERT = `#version 300 es
in vec4 a_position;
out vec2 v_uv;
void main() {
  v_uv = (a_position.xy + 1.0) * 0.5;
  gl_Position = a_position;
}`

// Background: peach gradient with soft blobs (light) or deep emerald (dark)
const FRAG_BG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_dark;
void main() {
  vec2 uv = v_uv;
  vec3 col;
  if (u_dark < 0.5) {
    // Light peach — like iOS screenshot backdrop
    col = mix(vec3(1.00, 0.96, 0.92), vec3(1.00, 0.90, 0.80), uv.y);
    col += 0.10 * vec3(1.0, 0.75, 0.55) * exp(-3.5 * length((uv - vec2(0.85, 0.85)) * vec2(u_resolution.x / u_resolution.y, 1.0)));
    col += 0.08 * vec3(0.45, 0.90, 0.70) * exp(-3.5 * length((uv - vec2(0.12, 0.15)) * vec2(u_resolution.x / u_resolution.y, 1.0)));
    col += 0.05 * vec3(1.0, 0.85, 0.70) * exp(-3.0 * length((uv - vec2(0.5, 0.1)) * vec2(u_resolution.x / u_resolution.y, 1.0)));
  } else {
    // Dark zambrut deep
    col = mix(vec3(0.03, 0.06, 0.05), vec3(0.06, 0.11, 0.09), uv.y);
    col += 0.14 * vec3(0.10, 0.65, 0.45) * exp(-3.0 * length((uv - vec2(0.8, 0.9)) * vec2(u_resolution.x / u_resolution.y, 1.0)));
    col += 0.10 * vec3(0.20, 0.80, 0.60) * exp(-3.5 * length((uv - vec2(0.15, 0.2)) * vec2(u_resolution.x / u_resolution.y, 1.0)));
  }
  fragColor = vec4(col, 1.0);
}`

const FRAG_BLUR = `#version 300 es
precision highp float;
#define MAX_BLUR_RADIUS 32
in vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform int u_blurRadius;
uniform float u_blurWeights[MAX_BLUR_RADIUS + 1];
uniform int u_horizontal;
out vec4 fragColor;
void main() {
  vec2 texel = 1.0 / u_resolution;
  vec4 color = texture(u_tex, v_uv) * u_blurWeights[0];
  for (int i = 1; i <= u_blurRadius; ++i) {
    float w = u_blurWeights[i];
    vec2 off = u_horizontal == 1 ? vec2(float(i) * texel.x, 0.0) : vec2(0.0, float(i) * texel.y);
    color += texture(u_tex, v_uv + off) * w;
    color += texture(u_tex, v_uv - off) * w;
  }
  fragColor = color;
}`

// ——— Main shader: SDF + Snell refraction + dispersion + fresnel + glare ———
const FRAG_MAIN = `#version 300 es
precision highp float;
#define PI 3.14159265359
const float N_R = 1.0 - 0.02;
const float N_G = 1.0;
const float N_B = 1.0 + 0.02;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_bg;
uniform sampler2D u_blurredBg;
uniform vec2 u_resolution;
uniform float u_dpr;
uniform vec2 u_mouseSpring;
uniform float u_shapeWidth;
uniform float u_shapeHeight;
uniform float u_shapeRadius;
uniform float u_shapeRoundness;
uniform float u_refThickness;
uniform float u_refDistance;
uniform float u_refFactor;
uniform float u_refDispersion;
uniform float u_refFresnelRange;
uniform float u_refFresnelHardness;
uniform float u_refFresnelFactor;
uniform float u_glareRange;
uniform float u_glareHardness;
uniform float u_glareFactor;
uniform float u_glareConvergence;
uniform float u_glareAngle;
uniform float u_dark;

float safeAsin(float x) { return asin(clamp(x, -1.0, 1.0)); }

float superellipseCornerSDF(vec2 p, float r, float n) {
  p = abs(p);
  return pow(pow(p.x, n) + pow(p.y, n), 1.0 / n) - r;
}

float roundedRectSDF(vec2 p, vec2 center, float width, float height, float cornerRadius, float n) {
  p -= center;
  float cr = cornerRadius * u_dpr;
  vec2 d = abs(p) - vec2(width * u_dpr, height * u_dpr) * 0.5;
  float dist;
  if (d.x > -cr && d.y > -cr) {
    vec2 cornerCenter = sign(p) * (vec2(width * u_dpr, height * u_dpr) * 0.5 - vec2(cr));
    dist = superellipseCornerSDF(p - cornerCenter, cr, n);
  } else {
    dist = min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
  }
  return dist;
}

float sdCircle(vec2 p, float r) { return length(p) - r; }

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float mainSDF(vec2 p1, vec2 p2, vec2 p) {
  vec2 p1n = p1 + p / u_resolution.y;
  vec2 p2n = p2 + p / u_resolution.y;
  float d1 = sdCircle(p1n, 90.0 * u_dpr / u_resolution.y);
  float d2 = roundedRectSDF(p2n, vec2(0.0), u_shapeWidth / u_resolution.y, u_shapeHeight / u_resolution.y, u_shapeRadius / u_resolution.y, u_shapeRoundness);
  return smin(d1, d2, 0.05);
}

vec2 getNormal(vec2 p1, vec2 p2, vec2 p) {
  float eps = 0.0007;
  vec2 e1 = vec2(1.0, 1.0);
  vec2 e2 = vec2(-1.0, 1.0);
  vec2 e3 = vec2(1.0, -1.0);
  vec2 e4 = vec2(-1.0, -1.0);
  return normalize(
    e1 * mainSDF(p1, p2, p + eps * e1) +
    e2 * mainSDF(p1, p2, p + eps * e2) +
    e3 * mainSDF(p1, p2, p + eps * e3) +
    e4 * mainSDF(p1, p2, p + eps * e4)
  );
}

float vec2ToAngle(vec2 v) {
  float a = atan(v.y, v.x);
  if (a < 0.0) a += 2.0 * PI;
  return a;
}

vec4 sampleDispersion(sampler2D tex, vec2 uv, vec2 offset, float factor) {
  vec4 pixel;
  pixel.r = texture(tex, uv + offset * (1.0 - (N_R - 1.0) * factor)).r;
  pixel.g = texture(tex, uv + offset * (1.0 - (N_G - 1.0) * factor)).g;
  pixel.b = texture(tex, uv + offset * (1.0 - (N_B - 1.0) * factor)).b;
  pixel.a = 1.0;
  return pixel;
}

void main() {
  vec2 res1x = u_resolution / u_dpr;
  vec2 p2 = (vec2(0.0) - u_mouseSpring) / u_resolution.y;
  vec2 p1 = (vec2(0.0) - u_resolution * 0.0) / u_resolution.y;
  float merged = mainSDF(p1 * 0.0, p2, gl_FragCoord.xy);

  if (merged >= 0.0) {
    fragColor = texture(u_bg, v_uv);
    return;
  }

  vec2 normal = getNormal(p1 * 0.0, p2, gl_FragCoord.xy);
  float nmerged = -1.0 * (merged * res1x.y);

  // Snell refraction — edge bend factor
  float x_R_ratio = 1.0 - nmerged / u_refThickness;
  float thetaI = safeAsin(pow(x_R_ratio, 2.0));
  float thetaT = safeAsin(1.0 / u_refFactor * sin(thetaI));
  float edgeFactor = -1.0 * tan(thetaT - thetaI);
  if (nmerged >= u_refThickness) edgeFactor = 0.0;

  // Fresnel — bright edge where light grazes
  float fresnelFactor = clamp(
    pow(1.0 + merged * res1x.y / 1500.0 * pow(500.0 / u_refFresnelRange, 2.0) + u_refFresnelHardness, 5.0),
    0.0, 1.0
  );

  // Glare — directional specular streak
  float glareGeoFactor = clamp(
    pow(1.0 + merged * res1x.y / 1500.0 * pow(500.0 / u_glareRange, 2.0) + u_glareHardness, 5.0),
    0.0, 1.0
  );
  float glareAngle = (vec2ToAngle(normalize(normal)) - PI / 4.0 + u_glareAngle) * 2.0;
  int glareFarside = 0;
  if (glareAngle > PI * 1.5 && glareAngle < PI * 3.5 || glareAngle < PI * -0.5) glareFarside = 1;
  float glareAngleFactor = (0.5 + sin(glareAngle) * 0.5) * (glareFarside == 1 ? 0.8 : 1.2) * u_glareFactor;
  glareAngleFactor = clamp(pow(glareAngleFactor, 0.3 + u_glareConvergence * 1.5), 0.0, 1.0);

  if (edgeFactor <= 0.0) {
    fragColor = texture(u_blurredBg, v_uv);
  } else {
    vec2 refracted = v_uv - normal * edgeFactor * u_refDistance * u_dpr * vec2(u_resolution.y / res1x.x, 1.0);
    vec4 blurredPixel = sampleDispersion(u_blurredBg, refracted, vec2(0.0), u_refDispersion * 0.01);
    fragColor = blurredPixel;
    fragColor = mix(fragColor, vec4(1.0), fresnelFactor * u_refFresnelFactor * 0.7);
    fragColor = mix(fragColor, vec4(1.0), glareAngleFactor * glareGeoFactor);
  }
}`

function gaussianKernel(radius: number): number[] {
  const sigma = radius / 3.0
  const kernel: number[] = []
  let sum = 0
  for (let i = 0; i <= radius; i++) {
    const w = Math.exp((-0.5 * i * i) / (sigma * sigma))
    kernel.push(w)
    sum += i === 0 ? w : w * 2
  }
  return kernel.map((w) => w / sum)
}

export class LiquidGlass {
  private canvas: HTMLCanvasElement
  private gl: WebGL2RenderingContext
  private opts: Required<LiquidGlassOptions>
  private progs: { bg: WebGLProgram; blurH: WebGLProgram; blurV: WebGLProgram; main: WebGLProgram }
  private fbo: WebGLFramebuffer[]
  private tex: WebGLTexture[]
  private raf = 0
  private mouse = { x: 0, y: 0 }
  private spring = { x: 0, y: 0 }
  private startTime = 0

  constructor(canvas: HTMLCanvasElement, opts: LiquidGlassOptions) {
    this.canvas = canvas
    this.opts = {
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      dark: false,
      shapeWidth: 400,
      shapeHeight: 200,
      shapeRadius: 60,
      shapeRoundness: 4,
      mouseFollow: true,
      ...opts,
    } as Required<LiquidGlassOptions>

    const gl = (this.gl = canvas.getContext('webgl2', { antialias: true, alpha: false })!)
    if (!gl) throw new Error('WebGL2 not supported')

    this.progs = {
      bg: this.compile(gl, VERT, FRAG_BG),
      blurH: this.compile(gl, VERT, FRAG_BLUR),
      blurV: this.compile(gl, VERT, FRAG_BLUR),
      main: this.compile(gl, VERT, FRAG_MAIN),
    }

    // Fullscreen triangle
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(this.progs.main, 'a_position')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    // Textures + FBOs (4 passes)
    this.tex = []
    this.fbo = []
    for (let i = 0; i < 4; i++) {
      const t = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      this.tex.push(t)
      const f = gl.createFramebuffer()!
      gl.bindFramebuffer(gl.FRAMEBUFFER, f)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0)
      this.fbo.push(f)
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    this.resize()
    window.addEventListener('resize', () => this.resize())
    canvas.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect()
      this.mouse.x = e.clientX - r.left
      this.mouse.y = e.clientY - r.top
    })
    canvas.addEventListener('pointerleave', () => {
      this.mouse.x = 0
      this.mouse.y = 0
    })

    this.startTime = performance.now()
    this.loop()
  }

  private compile(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s))
        throw new Error('Shader compile failed')
      }
      return s
    }
    const p = gl.createProgram()!
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vs))
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Program link failed')
    return p
  }

  private resize() {
    const { width, height, dpr } = this.opts
    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.canvas.style.width = width + 'px'
    this.canvas.style.height = height + 'px'
    const gl = this.gl
    for (let i = 0; i < 4; i++) {
      gl.bindTexture(gl.TEXTURE_2D, this.tex[i])
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.canvas.width, this.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    }
  }

  setTheme(dark: boolean) {
    this.opts.dark = dark
  }

  private loop = () => {
    this.render()
    this.raf = requestAnimationFrame(this.loop)
  }

  private render() {
    const gl = this.gl
    const { width, height, dpr } = this.opts
    const W = this.canvas.width
    const H = this.canvas.height
    const time = (performance.now() - this.startTime) / 1000

    // Spring for mouse-follow blob
    const tx = this.opts.mouseFollow ? (this.mouse.x - width / 2) * 0.15 : 0
    const ty = this.opts.mouseFollow ? (this.mouse.y - height / 2) * 0.15 : 0
    this.spring.x += (tx - this.spring.x) * 0.06
    this.spring.y += (ty - this.spring.y) * 0.06

    const kernel = gaussianKernel(12)
    const pass = (prog: WebGLProgram, inTex: WebGLTexture, outFbo: WebGLFramebuffer | null, uniforms: Record<string, unknown>) => {
      if (outFbo) gl.bindFramebuffer(gl.FRAMEBUFFER, outFbo)
      else gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, W, H)
      gl.useProgram(prog)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, inTex)
      for (const [k, v] of Object.entries(uniforms)) {
        const loc = gl.getUniformLocation(prog, k)
        if (loc === null) continue
        if (typeof v === 'number') gl.uniform1f(loc, v)
        else if (Array.isArray(v)) gl.uniform2f(loc, v[0], v[1])
        else if (v instanceof WebGLTexture) gl.uniform1i(loc, 0)
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    // Pass 1: background
    pass(this.progs.bg, this.tex[1], this.fbo[0], {
      u_resolution: [W, H], u_dpr: dpr, u_time: time, u_dark: this.opts.dark ? 1 : 0,
    })
    // Pass 2: blur H
    pass(this.progs.blurH, this.tex[0], this.fbo[1], {
      u_tex: this.tex[0], u_resolution: [W, H], u_blurRadius: 12,
      u_blurWeights: kernel, u_horizontal: 1,
    })
    // Pass 3: blur V
    pass(this.progs.blurV, this.tex[1], this.fbo[2], {
      u_tex: this.tex[1], u_resolution: [W, H], u_blurRadius: 12,
      u_blurWeights: kernel, u_horizontal: 0,
    })
    // Pass 4: main — liquid glass
    pass(this.progs.main, this.tex[0], null, {
      u_bg: this.tex[0], u_blurredBg: this.tex[2],
      u_resolution: [W, H], u_dpr: dpr, u_time: time,
      u_mouse: [this.mouse.x * dpr, this.mouse.y * dpr],
      u_mouseSpring: [this.spring.x * dpr, this.spring.y * dpr],
      u_shapeWidth: this.opts.shapeWidth, u_shapeHeight: this.opts.shapeHeight,
      u_shapeRadius: this.opts.shapeRadius, u_shapeRoundness: this.opts.shapeRoundness,
      u_refThickness: 20, u_refDistance: 0.05, u_refFactor: 1.4,
      u_refDispersion: 7, u_refFresnelRange: 30, u_refFresnelHardness: 20,
      u_refFresnelFactor: 20, u_glareRange: 30, u_glareHardness: 20,
      u_glareFactor: 90, u_glareConvergence: 50, u_glareAngle: -45,
      u_dark: this.opts.dark ? 1 : 0,
    })
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    const gl = this.gl
    for (const p of Object.values(this.progs)) gl.deleteProgram(p)
    for (const f of this.fbo) gl.deleteFramebuffer(f)
    for (const t of this.tex) gl.deleteTexture(t)
  }
}
