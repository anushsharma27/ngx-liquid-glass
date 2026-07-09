import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

const FILTER_ID = 'ngx-liquid-glass-filter';
const FILTER_ATTR = 'data-ngx-liquid-glass-filter';
const STYLES_ATTR = 'data-ngx-liquid-glass-styles';

const LIQUID_GLASS_STYLES = `
@property --ngx-liquid-glass-prism-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 216deg;
}

:where(.ngx-liquid-glass) {
  --lg-radius: 20px;
  --lg-tint: rgba(255,255,255,0.12);
  --lg-blur: 22px;
  --lg-saturation: 175%;
  --lg-filter-url: url("#ngx-liquid-glass-filter");
  --lg-lens-zoom: 1.075;
  --lg-refraction-opacity: 0.48;
  --lg-surface-opacity: 0.28;
  --lg-refraction-bleed: 18px;
  --lg-refraction-bg-color: transparent;
  --lg-refraction-bg-image: none;
  --lg-refraction-bg-position: 0 0;
  --lg-refraction-bg-size: auto;
  --lg-refraction-bg-repeat: no-repeat;
  --lg-refraction-bg-blend-mode: normal;
  --lg-edge-opacity: 0.4;
  --lg-edge-width: 1px;
  --lg-shadow-opacity: 0.16;
  --lg-corner-effect-opacity: 1;
  --lg-fallback-background: rgba(255,255,255,0.72);

  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: var(--lg-radius);
  background: var(--lg-tint);
  box-shadow:
    inset 0 1px 1px rgba(255,255,255,0.82),
    inset 0 -2px 4px rgba(42,49,61,var(--lg-shadow-opacity)),
    0 2px 5px rgba(36,43,55,var(--lg-shadow-opacity)),
    0 18px 48px rgba(36,43,55,var(--lg-shadow-opacity));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-saturation));
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-saturation));
  transform: translateZ(0);
}

:where(.ngx-liquid-glass)::before,
:where(.ngx-liquid-glass)::after {
  content: "";
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}

:where(.ngx-liquid-glass)::before {
  inset: calc(var(--lg-refraction-bleed) * -1);
  z-index: 0;
  background-color: var(--lg-refraction-bg-color);
  background-image: var(--lg-refraction-bg-image);
  background-position: var(--lg-refraction-bg-position);
  background-size: var(--lg-refraction-bg-size);
  background-repeat: var(--lg-refraction-bg-repeat);
  background-blend-mode: var(--lg-refraction-bg-blend-mode);
  filter: var(--lg-filter-url);
  opacity: var(--lg-refraction-opacity);
  transform: translateZ(0);
}

:where(.ngx-liquid-glass__source) {
  position: absolute;
  inset: calc(var(--lg-refraction-bleed) * -1);
  z-index: -1;
  pointer-events: none;
  filter: var(--lg-filter-url);
  opacity: 1;
  transform: scale(var(--lg-lens-zoom));
  transform-origin: center;
  -webkit-mask-image: radial-gradient(circle at center, transparent 0 52%, #000 76%, #000 100%);
  mask-image: radial-gradient(circle at center, transparent 0 52%, #000 76%, #000 100%);
}

:where(.ngx-liquid-glass__core) {
  position: absolute;
  inset: calc(var(--lg-refraction-bleed) * -1);
  z-index: -2;
  pointer-events: none;
  transform: scale(var(--lg-lens-zoom));
  transform-origin: center;
}

:where(.ngx-liquid-glass__core)::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.02) 42%, rgba(255,255,255,0.1)),
    var(--lg-tint);
  mix-blend-mode: screen;
  opacity: calc(var(--lg-surface-opacity) * 0.72);
}

:where(.ngx-liquid-glass[data-lg-refraction-mode="fluid"] .ngx-liquid-glass__core) {
  display: none;
}

:where(.ngx-liquid-glass[data-lg-refraction-mode="fluid"] .ngx-liquid-glass__source) {
  -webkit-mask-image: none;
  mask-image: none;
}

:where(.ngx-liquid-glass--clone-refraction) {
  background: transparent;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

:where(.ngx-liquid-glass--clone-refraction)::before {
  display: none;
}

:where(.ngx-liquid-glass)::after {
  inset: 0;
  z-index: 1;
  padding: var(--lg-edge-width);
  background:
    radial-gradient(62% 46% at 19% 4%, rgba(255,255,255,0.94), transparent 52%),
    radial-gradient(54% 42% at 84% 97%, rgba(255,255,255,0.52), transparent 56%),
    linear-gradient(130deg, rgba(255,255,255,0.62), rgba(255,255,255,0.08) 38%, rgba(255,255,255,0.36) 74%, rgba(255,255,255,0.72));
  opacity: calc(var(--lg-edge-opacity) * var(--lg-corner-effect-opacity));
  mix-blend-mode: screen;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(20,28,42,0.12);
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
}

:where(.ngx-liquid-glass[data-lg-edge-effect="prismatic"])::after {
  padding: max(var(--lg-edge-width), 2.5px);
  background:
    radial-gradient(40% 22% at 12% 7%, rgba(255,255,255,0.96), rgba(115,235,255,0.82) 30%, transparent 73%),
    radial-gradient(36% 22% at 88% 93%, rgba(255,255,255,0.68), rgba(255,116,192,0.72) 32%, transparent 73%),
    conic-gradient(from var(--ngx-liquid-glass-prism-angle) at 50% 50%, transparent 0deg 13deg, rgba(255,193,103,0.64) 18deg, rgba(143,128,255,0.76) 24deg, transparent 34deg 142deg, rgba(85,230,255,0.92) 151deg, rgba(255,255,255,0.92) 157deg, transparent 167deg 286deg, rgba(255,112,191,0.76) 294deg, rgba(255,195,106,0.62) 301deg, transparent 312deg);
  opacity: calc(var(--lg-edge-opacity) * var(--lg-corner-effect-opacity) * 1.2);
  mix-blend-mode: screen;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.86),
    inset 9px 7px 15px -13px rgba(84,230,255,0.82),
    inset -9px -7px 15px -13px rgba(255,114,191,0.7);
  animation: ngx-liquid-glass-prism-light 9s cubic-bezier(0.42, 0, 0.19, 1) infinite alternate;
  will-change: filter;
}

:where(.ngx-liquid-glass.ngx-liquid-glass--clone-refraction[data-lg-edge-effect="prismatic"])::before {
  display: block;
  inset: 3px;
  z-index: 0;
  background:
    radial-gradient(38% 24% at 13% 9%, rgba(88,229,255,0.34), transparent 72%),
    radial-gradient(34% 22% at 87% 92%, rgba(255,111,190,0.28), transparent 72%),
    conic-gradient(from var(--ngx-liquid-glass-prism-angle) at 50% 50%, transparent 0deg 16deg, rgba(255,192,106,0.38) 23deg, transparent 31deg 145deg, rgba(85,227,255,0.5) 153deg, transparent 164deg 290deg, rgba(255,112,190,0.4) 299deg, transparent 308deg);
  opacity: calc(var(--lg-edge-opacity) * var(--lg-corner-effect-opacity) * 0.72);
  mix-blend-mode: screen;
  -webkit-mask-image: radial-gradient(circle at center, transparent 0 55%, #000 80%, #000 100%);
  mask-image: radial-gradient(circle at center, transparent 0 55%, #000 80%, #000 100%);
  animation: ngx-liquid-glass-prism-light 9s cubic-bezier(0.42, 0, 0.19, 1) infinite alternate;
  will-change: filter;
}

@keyframes ngx-liquid-glass-prism-light {
  0% {
    --ngx-liquid-glass-prism-angle: 202deg;
    filter: brightness(0.96) saturate(1.05);
  }

  46% {
    --ngx-liquid-glass-prism-angle: 232deg;
    filter: brightness(1.14) saturate(1.22);
  }

  100% {
    --ngx-liquid-glass-prism-angle: 218deg;
    filter: brightness(1.02) saturate(1.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  :where(.ngx-liquid-glass[data-lg-edge-effect="prismatic"])::after {
    animation: none;
  }

  :where(.ngx-liquid-glass.ngx-liquid-glass--clone-refraction[data-lg-edge-effect="prismatic"])::before {
    animation: none;
  }
}

:where(.ngx-liquid-glass:not(.ngx-liquid-glass--refraction))::before {
  background:
    linear-gradient(135deg, rgba(255,255,255,0.46), rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.22)),
    linear-gradient(315deg, rgba(120,210,255,0.16), rgba(255,128,210,0.12));
  filter: none;
  opacity: 0.3;
}

:where(.ngx-liquid-glass.ngx-liquid-glass--fallback) {
  background:
    linear-gradient(var(--lg-fallback-background), var(--lg-fallback-background)),
    var(--lg-tint);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

:where(.ngx-liquid-glass.ngx-liquid-glass--fallback)::before {
  filter: none;
  opacity: 0.18;
}

:where(.ngx-liquid-glass.ngx-liquid-glass--fallback)::after {
  opacity: calc(var(--lg-edge-opacity) * 0.6);
}
`;

@Injectable({
  providedIn: 'root',
})
export class LiquidGlassFilterService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  ensureStyles(): void {
    if (!this.isBrowser || this.document.head.querySelector(`[${STYLES_ATTR}]`)) {
      return;
    }

    const style = this.document.createElement('style');
    style.setAttribute(STYLES_ATTR, '');
    style.textContent = LIQUID_GLASS_STYLES;
    this.document.head.appendChild(style);
  }

  ensureFilter(options: { animate?: boolean } = {}): void {
    if (!this.isBrowser || this.document.getElementById(FILTER_ID)) {
      return;
    }

    const svg = this.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute(FILTER_ATTR, '');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
    svg.innerHTML = this.createFilterDefs(options.animate === true);

    this.document.body.appendChild(svg);
  }

  private createFilterDefs(animate: boolean): string {
    const animation = animate
      ? '<animate attributeName="baseFrequency" dur="16s" values="0.008 0.008;0.012 0.006;0.008 0.008" repeatCount="indefinite" />'
      : '';

    return `
      <defs>
        ${this.createFilter(FILTER_ID, 42, animation)}
        ${this.createFilter(`${FILTER_ID}-subtle`, 20, animation)}
        ${this.createFilter(`${FILTER_ID}-vision`, 56, animation)}
      </defs>
    `;
  }

  private createFilter(id: string, displacementScale: number, animation: string): string {
    /*
     * A low turbulence frequency creates broad, glass-like ripples instead of
     * noisy texture. The displacement scale is the max source-pixel offset.
     */
    return `
      <filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="5" result="noise">
          ${animation}
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="${displacementScale}" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    `;
  }
}
