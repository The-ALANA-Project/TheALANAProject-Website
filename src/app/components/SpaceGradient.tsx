import { useEffect, useRef, useState } from 'react';

/**
 * SpaceGradient — WebGL2 shader background.
 * Adapted from original shader by Matthias Hurrle (@atzedent)
 * Original CodePen: https://codepen.io/atzedent/pen/NPKeGYJ
 * Modified for The ALANA Project with brand colors and grainy aesthetic.
 * Optimised: 30fps cap, mobile resolution scaling, pause when not visible.
 */
export function SpaceGradient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rendererRef = useRef<any>(null);
  const [, setIsVisible] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || rendererRef.current) return;

    const canvas = canvasRef.current;
    const isMobile = window.innerWidth < 768;
    const dpr = isMobile ? 1 : Math.min(2, window.devicePixelRatio);

    const vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

    const fragmentSrc = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;

#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)

float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}

float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
  a=rnd(i),
  b=rnd(i+vec2(1,0)),
  c=rnd(i+vec2(0,1)),
  d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

float fbm(vec2 p) {
  float t=.0, a=1.;
  mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}

float clouds(vec2 p) {
  float d=1., t=.0;
  for (float i=.0; i<3.; i++) {
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a);
    d=a;
    p*=2./(i+1.);
  }
  return t;
}

float grain(vec2 uv, float time) {
  vec2 grainUv = uv * R * 2.0;
  float grainValue = fract(sin(dot(grainUv + time, vec2(12.9898, 78.233))) * 43758.5453);
  return grainValue * 2.0 - 1.0;
}

void main(void) {
  vec2 uv=(FC-.5*R)/MN, st=uv*vec2(2,1);
  vec3 col=vec3(0);

  float bg=clouds(vec2(st.x+T*.5,-st.y));

  uv.x -= 0.4;
  uv*=1.-.3*(sin(T*.2)*.5+.5);

  for (float i=1.; i<12.; i++) {
    uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;
    float d=length(p);

    vec3 lavender = vec3(0.863, 0.761, 0.996);
    vec3 darkLavender = vec3(0.6, 0.5, 0.8);

    col+=.00125/d*(mix(darkLavender, lavender, sin(i)*.5+.5));

    float b=noise(i+p+bg*1.731);
    col+=.0015*b/length(max(p,vec2(b*p.x*.02,p.y)));

    vec3 bgColor = mix(
      vec3(bg*.149, bg*.141, bg*.141),
      vec3(bg*.6, bg*.5, bg*.8),
      0.25
    );
    col=mix(col, bgColor, d);
  }

  float grainValue = grain(uv, T);
  col += grainValue * 0.06;

  col = max(col, vec3(0.149, 0.141, 0.141));
  col = clamp(col, vec3(0.0), vec3(1.0));

  O=vec4(col,1);
}`;

    const vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

    class Renderer {
      gl: WebGL2RenderingContext;
      program: WebGLProgram | null = null;
      vs: WebGLShader | null = null;
      fs: WebGLShader | null = null;
      buffer: WebGLBuffer | null = null;
      frameId: number = 0;
      lastFrameTime: number = 0;
      frameInterval: number = 1000 / 30;
      isPaused: boolean = false;

      constructor(public canvas: HTMLCanvasElement, public scale: number) {
        const gl = canvas.getContext('webgl2');
        if (!gl) throw new Error('WebGL2 not supported');
        this.gl = gl;
      }

      compile(shader: WebGLShader, source: string) {
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
          console.error(this.gl.getShaderInfoLog(shader));
        }
      }

      setup() {
        const { gl } = this;
        this.vs = gl.createShader(gl.VERTEX_SHADER);
        this.fs = gl.createShader(gl.FRAGMENT_SHADER);
        if (!this.vs || !this.fs) return;
        this.compile(this.vs, vertexSrc);
        this.compile(this.fs, fragmentSrc);
        this.program = gl.createProgram();
        if (!this.program) return;
        gl.attachShader(this.program, this.vs);
        gl.attachShader(this.program, this.fs);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
          console.error(gl.getProgramInfoLog(this.program));
        }
      }

      init() {
        const { gl, program } = this;
        if (!program) return;
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        const pos = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
        (program as any).resolution = gl.getUniformLocation(program, 'resolution');
        (program as any).time = gl.getUniformLocation(program, 'time');
      }

      render(now = 0) {
        const { gl, program, buffer, canvas } = this;
        if (!program) return;
        gl.clearColor(0.149, 0.141, 0.141, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.uniform2f((program as any).resolution, canvas.width, canvas.height);
        gl.uniform1f((program as any).time, now * 1e-3);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      resize() {
        this.canvas.width = window.innerWidth * this.scale;
        this.canvas.height = window.innerHeight * this.scale;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      }

      loop(now: number) {
        if (this.isPaused) return;
        if (now - this.lastFrameTime >= this.frameInterval) {
          this.render(now);
          this.lastFrameTime = now;
        }
        this.frameId = requestAnimationFrame((t) => this.loop(t));
      }

      destroy() {
        cancelAnimationFrame(this.frameId);
        const { gl, program, vs, fs, buffer } = this;
        if (buffer) gl.deleteBuffer(buffer);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        if (program) gl.deleteProgram(program);
      }
    }

    const renderer = new Renderer(canvas, dpr);
    renderer.setup();
    renderer.init();
    renderer.resize();
    renderer.loop(0);
    rendererRef.current = renderer;

    const handleResize = () => renderer.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting;
          setIsVisible(visible);
          if (rendererRef.current) {
            rendererRef.current.isPaused = !visible;
            if (visible) rendererRef.current.loop(performance.now());
          }
        });
      },
      { threshold: 0.1 },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ background: '#262424' }}
      />
    </div>
  );
}
