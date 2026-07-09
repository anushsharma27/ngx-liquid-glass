export type LiquidGlassIntensity = 'subtle' | 'vivid' | 'vision';

/** Decorative treatment applied at the outer edge of a glass surface. */
export type LiquidGlassEdgeEffect = 'none' | 'white' | 'prismatic';

/** Whether refraction is concentrated at the lens edge or animated across the full surface. */
export type LiquidGlassRefractionMode = 'lens' | 'fluid';

export interface LiquidGlassPreset {
  blur: number;
  saturation: number;
  displacementScale: number;
  lensZoom: number;
  refractionOpacity: number;
  surfaceOpacity: number;
  edgeOpacity: number;
  edgeWidth: number;
  shadowOpacity: number;
}

export const LIQUID_GLASS_PRESETS: Record<LiquidGlassIntensity, LiquidGlassPreset> = {
  subtle: {
    blur: 12,
    saturation: 135,
    displacementScale: 20,
    lensZoom: 1.07,
    refractionOpacity: 0.38,
    surfaceOpacity: 0.16,
    edgeOpacity: 0.32,
    edgeWidth: 1,
    shadowOpacity: 0.1,
  },
  vivid: {
    blur: 22,
    saturation: 175,
    displacementScale: 42,
    lensZoom: 1.14,
    refractionOpacity: 0.52,
    surfaceOpacity: 0.28,
    edgeOpacity: 0.56,
    edgeWidth: 1.5,
    shadowOpacity: 0.16,
  },
  vision: {
    blur: 34,
    saturation: 215,
    displacementScale: 56,
    lensZoom: 1.2,
    refractionOpacity: 0.64,
    surfaceOpacity: 0.42,
    edgeOpacity: 0.76,
    edgeWidth: 2,
    shadowOpacity: 0.24,
  },
};
