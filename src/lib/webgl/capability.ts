/**
 * Context attributes for the hero renderer. By default the browser must refuse
 * software rendering (SwiftShader etc.): the static poster looks better than a
 * 5 fps beam, and getContext then returns null so the hero falls back.
 */
export function webglContextAttributes(allowSoftware = false): WebGLContextAttributes {
  return {
    failIfMajorPerformanceCaveat: !allowSoftware,
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  };
}

export function prefersSavingData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}

/**
 * Set by Playwright's init script only (see tests/e2e/hero-webgl.spec.ts):
 * headless browsers have no GPU. It must work in the production build, which is
 * what the e2e suite tests; setting it only changes the visitor's own device.
 */
export const SOFTWARE_WEBGL_TEST_FLAG = "__PB_ALLOW_SOFTWARE_WEBGL__";

export function softwareWebGLAllowed(): boolean {
  return (window as unknown as Record<string, unknown>)[SOFTWARE_WEBGL_TEST_FLAG] === true;
}
