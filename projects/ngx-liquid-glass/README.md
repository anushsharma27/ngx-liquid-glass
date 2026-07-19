# ngx-liquid-glass

Angular standalone directive for Apple-style liquid glass surfaces. Drop it onto existing markup; no wrapper component, no root providers, and no required configuration.

[![CI](https://github.com/anushsharma27/ngx-liquid-glass/actions/workflows/ci.yml/badge.svg)](https://github.com/anushsharma27/ngx-liquid-glass/actions/workflows/ci.yml)

## At a glance

- Standalone Angular directive—use it on a `div`, button, card, toolbar, or existing component host.
- CSS `backdrop-filter` base with optional SVG displacement refraction.
- Three intensity presets, three edge treatments, two refraction modes, tint, radius, and runtime disable control.
- Optional DOM-backed refraction for static text, cards, and illustrations behind the glass.
- SSR-safe, tree-shakeable, dependency-light, and usable without global providers.
- Capability-detected fallback when a browser cannot render backdrop filtering.
- Respects `prefers-reduced-motion` by disabling animated turbulence.

## Is this the right package?

Choose `ngx-liquid-glass` when you want a decorative, configurable glass surface in an Angular application without adopting a component library or moving content into a special wrapper component. It works especially well for cards, floating controls, navigation, lenses, and overlays placed over CSS backgrounds or mostly static DOM content.

Consider a different approach when you need native iOS controls, pixel capture of video or canvas, refraction of cross-origin content, or a guaranteed identical effect in every browser. This package progressively enhances supported browsers; its fallback prioritizes readability rather than visual parity.

## Compatibility

| `ngx-liquid-glass` | Angular | Status |
| --- | --- | --- |
| `0.0.6+` | 20, 21, 22 | Supported |
| `0.0.5` | 19, 20 | Previous release |

The package is built with Angular 20 in partial-Ivy mode and keeps Angular framework packages as peer dependencies, so Angular 20–22 applications use their own framework version. CI builds a standalone consumer application against every supported Angular major.

## Demo

Try the interactive playground: **[ngx-liquid-glass live demo](https://anushsharma27.github.io/ngx-liquid-glass/)**.

<p align="center">
  <img src="https://raw.githubusercontent.com/anushsharma27/ngx-liquid-glass/main/projects/ngx-liquid-glass/assets/demo-desktop.png" alt="ngx-liquid-glass interactive desktop playground" width="900" />
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/anushsharma27/ngx-liquid-glass/main/projects/ngx-liquid-glass/assets/demo-mobile.png" alt="ngx-liquid-glass responsive mobile playground" width="360" />
</p>

The playground exposes the directive's intensity, edge treatment, refraction mode, tint, and lens size controls. Drag the lens across the scene to see DOM-backed refraction in action.

### Prismatic fluid refraction

<p align="center">
  <img src="https://raw.githubusercontent.com/anushsharma27/ngx-liquid-glass/main/projects/ngx-liquid-glass/assets/demo-prismatic-fluid.png" alt="ngx-liquid-glass with vision intensity, prismatic edge, and fluid refraction" width="900" />
</p>

## Install

Recommended for Angular CLI projects:

```bash
ng add ngx-liquid-glass
```

The installation schematic installs the package and prints a minimal usage example; it does not rewrite application configuration. For npm, pnpm, or Yarn projects, install it directly:

```bash
npm install ngx-liquid-glass
```

## Minimal Usage

Import the standalone directive into the component that uses it:

```ts
import { Component } from '@angular/core';
import { NgxLiquidGlassDirective } from 'ngx-liquid-glass';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [NgxLiquidGlassDirective],
  template: `
    <div
      ngxLiquidGlass
      [lgIntensity]="'vivid'"
      [lgRadius]="24"
      [lgTint]="'rgba(255,255,255,0.15)'"
    >
      Any existing content
    </div>
  `,
})
export class PanelComponent {}
```

## Inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `lgIntensity` | `'subtle' \| 'vivid' \| 'vision'` | `'vivid'` | Preset for blur, saturation, edge glow, and SVG displacement strength. |
| `lgRadius` | `number` | `20` | Corner radius in pixels. |
| `lgTint` | `string` | `'rgba(255,255,255,0.12)'` | CSS color used as the glass tint. |
| `lgRefraction` | `boolean` | `true` | Toggles the SVG displacement-map refraction layer. |
| `lgBackdrop` | `HTMLElement \| string \| null` | `null` | Optional backdrop element or selector. It creates an inert visual clone, allowing the lens to refract text and other DOM content, not just a CSS background. |
| `lgEdgeEffect` | `'none' \| 'white' \| 'prismatic'` | `'white'` | Selects no decorative edge, a neutral highlight, or a chromatic edge treatment. |
| `lgRefractionMode` | `'lens' \| 'fluid'` | `'lens'` | Concentrates refraction at the lens edge or animates it across the full surface. |
| `lgDisabled` | `boolean` | `false` | Removes the visual effect while leaving the host element and content intact. |

## DOM Refraction

Use `lgBackdrop` when the glass sits over foreground DOM content such as text, cards, or an illustration. This is the path used by the demo lens.

```html
<section #scene class="artboard">
  <h1>Liquid glass</h1>
  <div ngxLiquidGlass [lgBackdrop]="scene" [lgRadius]="999"></div>
</section>
```

The directive clones that scene into an inert, clipped layer inside the glass host and applies the shared SVG filter to the clone. The clone is marked `aria-hidden`, inert, non-focusable, and non-interactive. It is a visual copy rather than a browser screenshot: dynamic DOM changes require a directive input update, and live video, canvas pixels, and cross-origin content cannot be captured this way.

## Browser and SSR behavior

| Capability | Behavior |
| --- | --- |
| `backdrop-filter` or `-webkit-backdrop-filter` supported | Frosted backdrop, saturation, optional SVG refraction, and edge treatment. |
| Backdrop filtering unavailable | Semi-opaque fallback tint and readable content without refraction. |
| JavaScript disabled or server rendering | Original host content remains; browser-only visual layers are not created. |

The directive detects capabilities at runtime instead of relying on browser names. It is SSR-safe and does not touch DOM or SVG APIs unless Angular is running in a browser.

## Accessibility

The directive does not replace the host element, change its semantic role, or remove its content from the accessibility tree. DOM refraction copies are hidden from assistive technology and cannot receive focus or pointer input. Animated filter turbulence is disabled when the user requests reduced motion.

You remain responsible for sufficient foreground contrast, visible focus styles, appropriate semantics, and testing text readability over the chosen tint and backdrop. Use `lgDisabled` to offer an application-level opt-out when appropriate.

## Performance

`ngx-liquid-glass` uses browser compositing primitives:

- `backdrop-filter: blur(...) saturate(...)` for the frosted base.
- One lazily injected SVG filter definition for turbulence-based displacement.
- A lightweight sampled copy of the nearest CSS background for the default refraction layer.
- An opt-in, inert DOM clone for refraction over actual text and other static DOM content.
- CSS pseudo-elements for the sampled refraction layer and edge highlight.

It does not use WebGL, `html2canvas`, canvas snapshots, or polling loops. The refraction layer tracks resize and scroll so CSS backgrounds and cloned scenes stay aligned behind each glass surface. Multiple directive instances share the same injected SVG filter and stylesheet.

### Package footprint

The Angular 20 production output currently contains one approximately 35 kB ESM bundle (about 7.4 kB gzip before application-level optimization) plus TypeScript declarations. The npm tarball is larger because it includes demo screenshots and schematic assets. `sideEffects: false` allows compatible bundlers to tree-shake unused exports.

The only direct runtime dependency is `tslib`; Angular framework packages remain peer dependencies and are not bundled into the library.

## Known limitations

- The result is Apple-inspired web styling, not Apple's native Liquid Glass implementation.
- Backdrop filtering and SVG displacement rendering vary by browser, GPU, page composition, and user settings.
- `lgBackdrop` clones DOM structure; it does not capture pixels from video, canvas, WebGL, or cross-origin embeds.
- A cloned backdrop is a visual snapshot of the DOM structure and is not automatically recreated after source-content changes.
- Large cloned scenes or many simultaneous glass surfaces can increase layout, paint, and compositing cost.
- Invalid backdrop selectors are ignored and fall back to automatic CSS-background sampling.

## Versioning and support

The project follows Semantic Versioning. While releases remain below `1.0.0`, minor versions may refine the public API; review the [changelog](https://github.com/anushsharma27/ngx-liquid-glass/blob/main/CHANGELOG.md) before upgrading.

- Reproducible bugs: [open a bug report](https://github.com/anushsharma27/ngx-liquid-glass/issues/new?template=bug_report.yml)
- Focused proposals: [request a feature](https://github.com/anushsharma27/ngx-liquid-glass/issues/new?template=feature_request.yml)
- Security concerns: follow the [private reporting policy](https://github.com/anushsharma27/ngx-liquid-glass/blob/main/SECURITY.md)
- General support expectations: read [SUPPORT.md](https://github.com/anushsharma27/ngx-liquid-glass/blob/main/SUPPORT.md)

## Contributing

Contributions are welcome. Read the [contribution guide](https://github.com/anushsharma27/ngx-liquid-glass/blob/main/CONTRIBUTING.md) and use the demo app for visual checks.

```bash
npm ci
npm run build:library
npm run test:library
npm run build:demo
npm run check:package
```

## License

[MIT](https://github.com/anushsharma27/ngx-liquid-glass/blob/main/LICENSE) © 2026 Anush Sharma
