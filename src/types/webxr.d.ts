export {};

declare global {
  interface XrWebGlContextAttributes extends WebGLContextAttributes {
    xrCompatible?: boolean;
  }

  interface HTMLCanvasElement {
    getContext(
      contextId: "webgl2",
      options?: XrWebGlContextAttributes,
    ): WebGL2RenderingContext | null;
  }
}
