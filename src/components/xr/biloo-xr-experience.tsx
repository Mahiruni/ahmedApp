"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./biloo-xr-experience.module.css";

type XrStatus = "checking" | "supported" | "unsupported" | "starting" | "active" | "error";

type Service = {
  key: string;
  label: string;
  eyebrow: string;
  description: string;
  icon: string;
  color: readonly [number, number, number, number];
};

type XrViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type XrView = {
  projectionMatrix: Float32Array;
  transform: {
    inverse: {
      matrix: Float32Array;
    };
  };
};

type XrViewerPose = {
  views: readonly XrView[];
};

type XrReferenceSpace = object;

type XrFrame = {
  session: XrSession;
  getViewerPose(referenceSpace: XrReferenceSpace): XrViewerPose | null;
};

type XrWebGlLayer = {
  framebuffer: WebGLFramebuffer | null;
  getViewport(view: XrView): XrViewport | null;
};

type XrSession = EventTarget & {
  renderState: {
    baseLayer?: XrWebGlLayer;
  };
  requestReferenceSpace(type: "local-floor" | "local" | "viewer"): Promise<XrReferenceSpace>;
  requestAnimationFrame(callback: (time: number, frame: XrFrame) => void): number;
  updateRenderState(state: { baseLayer: XrWebGlLayer }): void;
  end(): Promise<void>;
};

type XrSystem = {
  isSessionSupported(mode: "immersive-ar"): Promise<boolean>;
  requestSession(
    mode: "immersive-ar",
    options: {
      requiredFeatures: string[];
      optionalFeatures: string[];
    },
  ): Promise<XrSession>;
};

type XrWebGlLayerConstructor = new (
  session: XrSession,
  context: WebGL2RenderingContext,
  options?: { alpha?: boolean; antialias?: boolean },
) => XrWebGlLayer;

const SERVICES: readonly Service[] = [
  {
    key: "taxi",
    label: "Taxi",
    eyebrow: "Move",
    description: "Book rides and follow the driver in a spatial route view.",
    icon: "↗",
    color: [0.32, 0.27, 0.9, 0.94],
  },
  {
    key: "food",
    label: "Food",
    eyebrow: "Order",
    description: "Browse restaurants and keep live preparation updates in view.",
    icon: "◉",
    color: [0.96, 0.38, 0.2, 0.94],
  },
  {
    key: "market",
    label: "Market",
    eyebrow: "Shop",
    description: "Build grocery baskets while staying aware of your environment.",
    icon: "◇",
    color: [0.14, 0.7, 0.55, 0.94],
  },
  {
    key: "construction",
    label: "Materials",
    eyebrow: "Build",
    description: "Compare construction supplies using a wide spatial workspace.",
    icon: "▰",
    color: [0.9, 0.66, 0.12, 0.94],
  },
  {
    key: "parts",
    label: "Car parts",
    eyebrow: "Repair",
    description: "Review compatible parts and supplier details side by side.",
    icon: "✦",
    color: [0.16, 0.58, 0.94, 0.94],
  },
];

const PANEL_POSITIONS = [
  [-1.18, 0.5, -2.45],
  [0, 0.68, -2.15],
  [1.18, 0.5, -2.45],
  [-0.64, -0.42, -2.22],
  [0.64, -0.42, -2.22],
] as const;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create the XR shader.");

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader compilation error.";
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const vertexShader = compileShader(
    gl,
    gl.VERTEX_SHADER,
    `#version 300 es
      in vec3 aPosition;
      uniform mat4 uModel;
      uniform mat4 uView;
      uniform mat4 uProjection;
      out vec2 vUv;

      void main() {
        vUv = aPosition.xy + vec2(0.5);
        gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
      }
    `,
  );

  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    `#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform vec4 uColor;
      out vec4 outColor;

      void main() {
        float radius = 0.14;
        vec2 centered = abs(vUv - vec2(0.5)) - vec2(0.5 - radius);
        float distanceToEdge = length(max(centered, vec2(0.0))) - radius;
        float alpha = 1.0 - smoothstep(-0.018, 0.012, distanceToEdge);
        float edge = 1.0 - smoothstep(0.015, 0.065, abs(distanceToEdge));
        vec3 glow = mix(uColor.rgb, vec3(1.0), edge * 0.34);
        outColor = vec4(glow, uColor.a * alpha);
      }
    `,
  );

  const program = gl.createProgram();
  if (!program) throw new Error("Could not create the XR rendering program.");

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "Unknown XR program link error.";
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

function createModelMatrix(
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
): Float32Array {
  return new Float32Array([
    width,
    0,
    0,
    0,
    0,
    height,
    0,
    0,
    0,
    0,
    1,
    0,
    x,
    y,
    z,
    1,
  ]);
}

function getXrSystem(): XrSystem | undefined {
  return (navigator as Navigator & { xr?: XrSystem }).xr;
}

export function BilooXrExperience() {
  const [status, setStatus] = useState<XrStatus>("checking");
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [message, setMessage] = useState("Checking this device for immersive WebXR support…");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<XrSession | null>(null);
  const supportedRef = useRef(false);
  const activeServiceRef = useRef(0);

  useEffect(() => {
    activeServiceRef.current = activeServiceIndex;
  }, [activeServiceIndex]);

  useEffect(() => {
    let cancelled = false;

    async function detectXr() {
      const xr = getXrSystem();
      if (!xr) {
        if (!cancelled) {
          setStatus("unsupported");
          setMessage("Immersive mode is unavailable in this browser. The standard BILOO workspace remains available below.");
        }
        return;
      }

      try {
        const supported = await xr.isSessionSupported("immersive-ar");
        if (cancelled) return;

        supportedRef.current = supported;
        setStatus(supported ? "supported" : "unsupported");
        setMessage(
          supported
            ? "Galaxy XR mode is ready. Put on the headset and launch the spatial workspace."
            : "This device does not currently expose immersive AR. You can still use the complete 2D workspace.",
        );
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("BILOO could not verify XR support. Reload the page or open it in Chrome on Android XR.");
        }
      }
    }

    void detectXr();

    return () => {
      cancelled = true;
      const activeSession = sessionRef.current;
      if (activeSession) void activeSession.end().catch(() => undefined);
    };
  }, []);

  const endSession = useCallback(async () => {
    const activeSession = sessionRef.current;
    if (activeSession) await activeSession.end();
  }, []);

  const startSession = useCallback(async () => {
    if (status === "active") {
      await endSession();
      return;
    }

    const xr = getXrSystem();
    const canvas = canvasRef.current;
    const XrLayer = (window as typeof window & { XRWebGLLayer?: XrWebGlLayerConstructor })
      .XRWebGLLayer;

    if (!xr || !canvas || !XrLayer) {
      setStatus("unsupported");
      setMessage("Open BILOO Spatial in Chrome on Samsung Galaxy XR to enter immersive mode.");
      return;
    }

    setStatus("starting");
    setMessage("Preparing the BILOO spatial workspace…");

    try {
      const gl = canvas.getContext("webgl2", {
        alpha: true,
        antialias: true,
        depth: true,
        xrCompatible: true,
      });

      if (!gl) throw new Error("WebGL 2 is required for the spatial workspace.");

      const makeXrCompatible = (
        gl as WebGL2RenderingContext & { makeXRCompatible?: () => Promise<void> }
      ).makeXRCompatible;
      if (makeXrCompatible) await makeXrCompatible.call(gl);

      const session = await xr.requestSession("immersive-ar", {
        requiredFeatures: ["local-floor"],
        optionalFeatures: ["hand-tracking", "anchors", "hit-test", "depth-sensing"],
      });
      sessionRef.current = session;

      const layer = new XrLayer(session, gl, { alpha: true, antialias: true });
      session.updateRenderState({ baseLayer: layer });
      const referenceSpace = await session.requestReferenceSpace("local-floor");

      const program = createProgram(gl);
      const vertexBuffer = gl.createBuffer();
      const vertexArray = gl.createVertexArray();
      if (!vertexBuffer || !vertexArray) throw new Error("Could not allocate the XR scene buffers.");

      const vertices = new Float32Array([
        -0.5, -0.5, 0,
        0.5, -0.5, 0,
        0.5, 0.5, 0,
        -0.5, -0.5, 0,
        0.5, 0.5, 0,
        -0.5, 0.5, 0,
      ]);

      gl.bindVertexArray(vertexArray);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(program, "aPosition");
      const modelLocation = gl.getUniformLocation(program, "uModel");
      const viewLocation = gl.getUniformLocation(program, "uView");
      const projectionLocation = gl.getUniformLocation(program, "uProjection");
      const colorLocation = gl.getUniformLocation(program, "uColor");

      if (
        positionLocation < 0 ||
        !modelLocation ||
        !viewLocation ||
        !projectionLocation ||
        !colorLocation
      ) {
        throw new Error("The XR scene could not resolve its shader inputs.");
      }

      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      let ended = false;

      const releaseResources = () => {
        gl.deleteBuffer(vertexBuffer);
        gl.deleteVertexArray(vertexArray);
        gl.deleteProgram(program);
      };

      const handleEnd = () => {
        ended = true;
        releaseResources();
        sessionRef.current = null;
        setStatus(supportedRef.current ? "supported" : "unsupported");
        setMessage("Spatial session closed. Your selected BILOO service is saved on this screen.");
      };

      const handleSelect = () => {
        setActiveServiceIndex((current) => (current + 1) % SERVICES.length);
      };

      session.addEventListener("end", handleEnd, { once: true });
      session.addEventListener("select", handleSelect);

      const renderFrame = (_time: number, frame: XrFrame) => {
        if (ended) return;

        const pose = frame.getViewerPose(referenceSpace);
        if (pose) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
          gl.clearColor(0.01, 0.015, 0.04, 0);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          gl.useProgram(program);
          gl.bindVertexArray(vertexArray);

          for (const view of pose.views) {
            const viewport = layer.getViewport(view);
            if (!viewport) continue;

            gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
            gl.uniformMatrix4fv(viewLocation, false, view.transform.inverse.matrix);
            gl.uniformMatrix4fv(projectionLocation, false, view.projectionMatrix);

            gl.uniformMatrix4fv(modelLocation, false, createModelMatrix(0, 0.08, -2.92, 3.45, 2.18));
            gl.uniform4fv(colorLocation, new Float32Array([0.025, 0.035, 0.1, 0.72]));
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            SERVICES.forEach((service, index) => {
              const [x, y, z] = PANEL_POSITIONS[index];
              const isActive = index === activeServiceRef.current;
              const pulse = isActive ? 1.16 : 1;
              const width = (isActive ? 0.93 : 0.78) * pulse;
              const height = (isActive ? 0.58 : 0.48) * pulse;

              gl.uniformMatrix4fv(modelLocation, false, createModelMatrix(x, y, z, width, height));
              gl.uniform4fv(colorLocation, new Float32Array(service.color));
              gl.drawArrays(gl.TRIANGLES, 0, 6);
            });
          }
        }

        session.requestAnimationFrame(renderFrame);
      };

      setStatus("active");
      setMessage("BILOO Spatial is active. Use a pinch or controller select to move through services.");
      session.requestAnimationFrame(renderFrame);
    } catch (error) {
      sessionRef.current = null;
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "The immersive session could not start. Check the headset permissions and try again.",
      );
    }
  }, [endSession, status]);

  const selectedService = SERVICES[activeServiceIndex];
  const launchDisabled = status === "checking" || status === "starting" || status === "unsupported";

  return (
    <main className={styles.page}>
      <canvas aria-hidden="true" className={styles.xrCanvas} ref={canvasRef} />

      <div className={styles.ambientOne} />
      <div className={styles.ambientTwo} />

      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Back to BILOO home">
          <span className={styles.brandMark}>B</span>
          <span>
            <strong>BILOO</strong>
            <small>Spatial</small>
          </span>
        </Link>

        <div className={styles.deviceBadge}>
          <span /> Samsung Galaxy XR · Android XR
        </div>

        <Link className={styles.backLink} href="/biloo">
          Standard app
        </Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>BILOO FOR GALAXY XR</span>
          <h1>
            Your everyday services,
            <strong> placed around you.</strong>
          </h1>
          <p>
            Launch a hands-aware spatial workspace for rides, food, groceries, construction materials,
            and car parts. The experience adapts automatically when immersive WebXR is unavailable.
          </p>

          <div className={styles.actions}>
            <button
              className={styles.primaryAction}
              disabled={launchDisabled}
              onClick={() => void startSession()}
              type="button"
            >
              {status === "active"
                ? "Exit spatial mode"
                : status === "starting"
                  ? "Starting…"
                  : "Enter Galaxy XR"}
              <span aria-hidden="true">↗</span>
            </button>
            <Link className={styles.secondaryAction} href="/auth/sign-up">
              Create BILOO account
            </Link>
          </div>

          <div className={styles.status} data-state={status} role="status" aria-live="polite">
            <i />
            <span>{message}</span>
          </div>
        </div>

        <div className={styles.headsetStage} aria-label="Samsung Galaxy XR spatial interface preview">
          <div className={styles.headsetGlow} />
          <div className={styles.headset}>
            <div className={styles.headsetBridge} />
            <div className={styles.lensLeft} />
            <div className={styles.lensRight} />
            <div className={styles.sensorOne} />
            <div className={styles.sensorTwo} />
            <div className={styles.sensorThree} />
          </div>
          <div className={styles.spatialPanel}>
            <span>{selectedService.eyebrow}</span>
            <strong>{selectedService.label}</strong>
            <small>{selectedService.description}</small>
          </div>
          <div className={styles.handHint}>Pinch to select</div>
        </div>
      </section>

      <section className={styles.workspace} aria-labelledby="workspace-title">
        <div className={styles.sectionHeading}>
          <div>
            <span>SPATIAL SERVICE DOCK</span>
            <h2 id="workspace-title">Choose what stays in focus.</h2>
          </div>
          <p>
            On Galaxy XR, each service becomes a floating panel. Select cycles through the dock while
            preserving a clear view of the real world.
          </p>
        </div>

        <div className={styles.serviceGrid}>
          {SERVICES.map((service, index) => (
            <button
              className={index === activeServiceIndex ? styles.serviceCardActive : styles.serviceCard}
              key={service.key}
              onClick={() => setActiveServiceIndex(index)}
              type="button"
              aria-pressed={index === activeServiceIndex}
            >
              <span className={styles.serviceIcon}>{service.icon}</span>
              <span className={styles.serviceEyebrow}>{service.eyebrow}</span>
              <strong>{service.label}</strong>
              <small>{service.description}</small>
              <i>0{index + 1}</i>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.capabilities}>
        <article>
          <span>01</span>
          <div>
            <strong>Hand and controller input</strong>
            <p>Use headset select gestures to move through the five BILOO service panels.</p>
          </div>
        </article>
        <article>
          <span>02</span>
          <div>
            <strong>Passthrough-first workspace</strong>
            <p>Immersive AR keeps services visible without disconnecting you from your surroundings.</p>
          </div>
        </article>
        <article>
          <span>03</span>
          <div>
            <strong>Automatic fallback</strong>
            <p>Phones, laptops, and unsupported browsers receive the complete responsive 2D interface.</p>
          </div>
        </article>
      </section>

      <footer className={styles.footer}>
        <span>BILOO Spatial · Addis Ababa, Ethiopia</span>
        <span>WebXR experience for Samsung Galaxy XR and compatible Android XR devices</span>
      </footer>
    </main>
  );
}
