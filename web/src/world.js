import * as THREE from 'three';
import { rand } from './util.js';

const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){float s=0.0,a=0.5;for(int i=0;i<5;i++){s+=a*snoise(p);p*=2.03;a*=0.5;}return s;}
`;

const SKY_FRAG = /* glsl */ `
uniform vec3 uBase, uA, uB, uC, uSunCol, uSunDir;
uniform float uSeed;
varying vec3 vDir;
${NOISE_GLSL}
void main(){
  vec3 d = normalize(vDir);
  vec3 p = d * 1.7 + vec3(uSeed, uSeed * 0.37, -uSeed * 0.61);
  vec3 q = vec3(fbm(p), fbm(p + 5.2), fbm(p + 9.7));
  float n = fbm(p + q * 1.6);
  float n2 = fbm(p * 2.1 - q + 3.0);
  float band = exp(-pow(d.y * 2.0 + 0.35 * q.x, 2.0));
  float neb = smoothstep(-0.15, 0.75, n) * (0.25 + 0.75 * band);
  vec3 col = uBase;
  col += uA * neb * 0.55;
  col += uB * smoothstep(0.15, 0.85, n2) * neb * 0.5;
  col += uC * smoothstep(0.2, 0.9, q.y) * 0.22 * band;
  float dust = smoothstep(0.05, 0.6, fbm(p * 3.1 + 7.0));
  col *= mix(1.0, 0.35, dust * band);
  float sd = max(dot(d, uSunDir), 0.0);
  col += uSunCol * (pow(sd, 1400.0) * 8.0 + pow(sd, 90.0) * 0.6 + pow(sd, 10.0) * 0.08);
  gl_FragColor = vec4(col, 1.0);
}`;

const PLANET_VERT = /* glsl */ `
varying vec3 vN; varying vec3 vP; varying vec3 vV;
void main(){
  vN = normalize(normal);
  vP = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vV = normalize(cameraPosition - wp.xyz);
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const PLANET_FRAG = /* glsl */ `
uniform vec3 uCol, uSunDir, uAtm;
uniform float uSeed;
varying vec3 vN; varying vec3 vP; varying vec3 vV;
${NOISE_GLSL}
void main(){
  vec3 n = normalize(vN);
  vec3 lp = normalize(vP);
  float bands = fbm(vec3(lp.y * 6.0 + fbm(lp * 2.0 + uSeed) * 1.4, uSeed, 0.0));
  float spots = fbm(lp * 4.0 + uSeed);
  vec3 c = uCol * (0.65 + 0.45 * bands) * (0.85 + 0.3 * spots);
  float lit = max(dot(n, uSunDir), 0.0);
  float term = smoothstep(-0.1, 0.4, dot(n, uSunDir));
  vec3 col = c * (0.02 + lit * 1.1) ;
  float rim = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 3.0);
  col += uAtm * rim * (0.15 + 0.9 * term);
  gl_FragColor = vec4(col, 1.0);
}`;

const RING_FRAG = /* glsl */ `
uniform vec3 uCol; uniform float uInner, uOuter;
varying vec3 vP;
void main(){
  float r = (length(vP.xy) - uInner) / (uOuter - uInner);
  float b = 0.5 + 0.5 * sin(r * 60.0) * sin(r * 13.0 + 1.0);
  float a = smoothstep(0.0, 0.08, r) * smoothstep(1.0, 0.85, r) * (0.25 + 0.6 * b);
  gl_FragColor = vec4(uCol * (0.55 + 0.45 * b), a * 0.8);
}`;

export class World {
  constructor(renderer, scene, quality) {
    this.renderer = renderer;
    this.scene = scene;
    this.quality = quality;
    const size = quality === 0 ? 512 : quality === 1 ? 1024 : 1536;
    this.cubeRT = new THREE.WebGLCubeRenderTarget(size, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    this.cubeCam = new THREE.CubeCamera(0.1, 1000, this.cubeRT);

    this.sun = new THREE.DirectionalLight(0xffffff, 2.4);
    this.sunTarget = new THREE.Object3D();
    this.sun.target = this.sunTarget;
    scene.add(this.sun, this.sunTarget);
    this.hemi = new THREE.HemisphereLight(0x8899cc, 0x221122, 0.55);
    scene.add(this.hemi);
    this.fill = new THREE.DirectionalLight(0x8899ff, 0.35);
    scene.add(this.fill);
    scene.fog = new THREE.Fog(0x000000, 800, 3800);

    this._initDust();
  }

  setTheme(theme, seed) {
    const scene = this.scene;
    const sunDir = new THREE.Vector3(...theme.sunDir).normalize();
    this.sunDir = sunDir;
    this.sun.color.set(theme.sun);
    this.sun.position.copy(sunDir).multiplyScalar(1000);
    this.fill.position.copy(sunDir).multiplyScalar(-1000).setY(-300);
    this.hemi.color.set(theme.hemiSky);
    this.hemi.groundColor.set(theme.hemiGround);
    scene.fog.color.set(theme.fog);

    // Build a temporary sky scene and bake it into a cubemap once.
    const sky = new THREE.Scene();
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: {
        uBase: { value: new THREE.Color(theme.base) },
        uA: { value: new THREE.Color(theme.nebA) },
        uB: { value: new THREE.Color(theme.nebB) },
        uC: { value: new THREE.Color(theme.nebC) },
        uSunCol: { value: new THREE.Color(theme.sun) },
        uSunDir: { value: sunDir },
        uSeed: { value: seed * 1.37 },
      },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: SKY_FRAG,
    });
    const skyGeo = new THREE.SphereGeometry(100, 48, 32);
    sky.add(new THREE.Mesh(skyGeo, skyMat));

    // Stars
    const N = this.quality === 0 ? 3500 : 6500;
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), size = new Float32Array(N);
    const v = new THREE.Vector3(), c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      v.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize().multiplyScalar(90);
      pos.set([v.x, v.y, v.z], i * 3);
      const t = Math.random();
      c.setHSL(t < 0.3 ? 0.6 : t < 0.5 ? 0.08 : 0.12, rand(0.2, 0.6), rand(0.65, 0.95));
      col.set([c.r, c.g, c.b], i * 3);
      size[i] = Math.random() < 0.03 ? rand(3, 5) : rand(0.8, 2.2);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    sg.setAttribute('scol', new THREE.BufferAttribute(col, 3));
    sg.setAttribute('ssize', new THREE.BufferAttribute(size, 1));
    const starMat = new THREE.ShaderMaterial({
      depthWrite: false, transparent: true, blending: THREE.AdditiveBlending,
      vertexShader: 'attribute vec3 scol; attribute float ssize; varying vec3 vC; void main(){ vC = scol; gl_PointSize = ssize * ' + (this.quality === 0 ? '0.7' : '1.0') + '; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec3 vC; void main(){ float d = length(gl_PointCoord-0.5)*2.0; float a = 1.0 - smoothstep(0.2,1.0,d); gl_FragColor = vec4(vC*a*1.4, 1.0); }',
    });
    sky.add(new THREE.Points(sg, starMat));

    // Planet (+ optional ring)
    const pd = new THREE.Vector3(...theme.planet.dir).normalize();
    const pr = theme.planet.size * 40;
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(pr, 64, 48),
      new THREE.ShaderMaterial({
        uniforms: {
          uCol: { value: new THREE.Color(theme.planet.color) },
          uAtm: { value: new THREE.Color(theme.planet.color).lerp(new THREE.Color(0xffffff), 0.4) },
          uSunDir: { value: sunDir },
          uSeed: { value: seed * 0.71 },
        },
        vertexShader: PLANET_VERT, fragmentShader: PLANET_FRAG,
      })
    );
    planet.position.copy(pd).multiplyScalar(80);
    planet.rotation.set(0.3, seed, 0.2);
    sky.add(planet);
    if (theme.planet.ring) {
      const inner = pr * 1.35, outer = pr * 2.3;
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(inner, outer, 96, 1),
        new THREE.ShaderMaterial({
          transparent: true, side: THREE.DoubleSide, depthWrite: false,
          uniforms: { uCol: { value: new THREE.Color(theme.planet.color).lerp(new THREE.Color(0xffffff), 0.5) }, uInner: { value: inner }, uOuter: { value: outer } },
          vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
          fragmentShader: RING_FRAG,
        })
      );
      ring.position.copy(planet.position);
      ring.lookAt(0, 0, 0);
      ring.rotateX(1.15);
      ring.rotateY(0.25);
      sky.add(ring);
    }

    this.cubeCam.update(this.renderer, sky);
    scene.background = this.cubeRT.texture;
    scene.environment = this.cubeRT.texture;
    scene.environmentIntensity = 0.55;
    scene.backgroundIntensity = 1.0;

    sky.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
  }

  _initDust() {
    const N = this.quality === 0 ? 260 : 480;
    this.dustN = N;
    this.dustBox = 240;
    this.dustPts = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i++) this.dustPts[i] = rand(-0.5, 0.5) * this.dustBox;
    const pos = new Float32Array(N * 6);
    const col = new Float32Array(N * 6);
    for (let i = 0; i < N; i++) {
      const b = rand(0.35, 0.8);
      col.set([b, b, b * 1.1, 0, 0, 0], i * 6);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.dust = new THREE.LineSegments(g, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
    }));
    this.dust.frustumCulled = false;
    this.scene.add(this.dust);
  }

  update(dt, center, vel) {
    // Space dust that wraps around the camera; streak length conveys speed.
    const B = this.dustBox, h = B / 2;
    const P = this.dustPts;
    const arr = this.dust.geometry.attributes.position.array;
    const k = 0.045;
    for (let i = 0; i < this.dustN; i++) {
      const i3 = i * 3, i6 = i * 6;
      let x = P[i3], y = P[i3 + 1], z = P[i3 + 2];
      // local coords relative to center, wrapped
      let lx = ((((x - center.x + h) % B) + B) % B) - h;
      let ly = ((((y - center.y + h) % B) + B) % B) - h;
      let lz = ((((z - center.z + h) % B) + B) % B) - h;
      const wx = center.x + lx, wy = center.y + ly, wz = center.z + lz;
      arr[i6] = wx; arr[i6 + 1] = wy; arr[i6 + 2] = wz;
      arr[i6 + 3] = wx - vel.x * k; arr[i6 + 4] = wy - vel.y * k; arr[i6 + 5] = wz - vel.z * k;
    }
    this.dust.geometry.attributes.position.needsUpdate = true;
    this.sunTarget.position.copy(center);
    this.sun.position.copy(this.sunDir).multiplyScalar(1000).add(center);
  }
}
