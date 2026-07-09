import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  Renderer2,
  RendererStyleFlags2,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { LiquidGlassFilterService } from './liquid-glass-filter.service';
import {
  LIQUID_GLASS_PRESETS,
  LiquidGlassEdgeEffect,
  LiquidGlassIntensity,
  LiquidGlassRefractionMode,
} from './liquid-glass.types';

@Directive({
  selector: '[ngxLiquidGlass]',
  standalone: true,
  host: {
    '[class.ngx-liquid-glass]': 'isActive()',
    '[class.ngx-liquid-glass--fallback]': 'isFallback()',
    '[class.ngx-liquid-glass--refraction]': 'isRefractionActive()',
    '[class.ngx-liquid-glass--clone-refraction]': 'isCloneRefractionActive()',
    '[class.ngx-liquid-glass--disabled]': 'lgDisabled()',
    '[attr.data-lg-intensity]': 'isActive() ? normalizedIntensity() : null',
    '[attr.data-lg-edge-effect]': 'isActive() ? normalizedEdgeEffect() : null',
    '[attr.data-lg-refraction-mode]': 'isActive() ? normalizedRefractionMode() : null',
  },
})
export class NgxLiquidGlassDirective {
  readonly lgIntensity = input<LiquidGlassIntensity>('vivid');
  readonly lgRadius = input<number>(20);
  readonly lgTint = input<string>('rgba(255,255,255,0.12)');
  readonly lgRefraction = input<boolean>(true);
  readonly lgBackdrop = input<HTMLElement | string | null>(null);
  readonly lgEdgeEffect = input<LiquidGlassEdgeEffect>('white');
  readonly lgRefractionMode = input<LiquidGlassRefractionMode>('lens');
  readonly lgDisabled = input<boolean>(false);

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly filterService = inject(LiquidGlassFilterService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly backdropSupported = signal(false);
  private readonly backdropSyncCleanup: Array<() => void> = [];
  private backdropSyncActive = false;
  private backdropSyncFrame = 0;
  private resizeObserver: ResizeObserver | null = null;
  private hostStyleObserver: MutationObserver | null = null;
  private observedBackdropSource: HTMLElement | null = null;
  private refractionLayer: HTMLDivElement | null = null;
  private coreRefractionLayer: HTMLDivElement | null = null;
  private clonedBackdrop: HTMLElement | null = null;
  private coreBackdrop: HTMLElement | null = null;
  private clonedBackdropSource: HTMLElement | null = null;

  readonly normalizedIntensity = computed(() => this.normalizeIntensity(this.lgIntensity()));
  readonly normalizedEdgeEffect = computed(() => this.normalizeEdgeEffect(this.lgEdgeEffect()));
  readonly normalizedRefractionMode = computed(() => this.normalizeRefractionMode(this.lgRefractionMode()));
  readonly isActive = computed(() => this.isBrowser && !this.lgDisabled());
  readonly isFallback = computed(() => this.isActive() && !this.backdropSupported());
  readonly isRefractionActive = computed(() => this.isActive() && this.lgRefraction() && this.backdropSupported());
  readonly isCloneRefractionActive = computed(() => this.isRefractionActive() && this.lgBackdrop() !== null);

  constructor() {
    if (this.isBrowser) {
      this.backdropSupported.set(this.supportsBackdropFilter());
      this.filterService.ensureStyles();
    }

    effect(() => {
      const intensity = this.normalizedIntensity();
      const preset = LIQUID_GLASS_PRESETS[intensity];
      const edgeEffect = this.normalizedEdgeEffect();
      const radius = this.coerceRadius(this.lgRadius());
      const tint = this.lgTint();
      const refractionActive = this.isRefractionActive();
      this.lgBackdrop();

      this.setStyleProperty('--lg-radius', `${radius}px`);
      this.setStyleProperty('--lg-tint', tint);
      this.setStyleProperty('--lg-blur', `${preset.blur}px`);
      this.setStyleProperty('--lg-saturation', `${preset.saturation}%`);
      this.setStyleProperty('--lg-displacement-scale', `${preset.displacementScale}`);
      this.setStyleProperty('--lg-lens-zoom', `${preset.lensZoom}`);
      this.setStyleProperty('--lg-refraction-opacity', `${preset.refractionOpacity}`);
      this.setStyleProperty('--lg-surface-opacity', `${preset.surfaceOpacity}`);
      this.setStyleProperty('--lg-edge-opacity', `${preset.edgeOpacity}`);
      this.setStyleProperty('--lg-edge-width', `${preset.edgeWidth}px`);
      this.setStyleProperty('--lg-shadow-opacity', `${preset.shadowOpacity}`);
      this.setStyleProperty('--lg-corner-effect-opacity', edgeEffect === 'none' ? '0' : '1');
      this.setStyleProperty('--lg-filter-url', this.filterUrlFor(intensity));

      if (this.isActive()) {
        this.filterService.ensureStyles();
      }

      if (refractionActive) {
        this.filterService.ensureFilter({ animate: !this.prefersReducedMotion() });
        this.startBackdropSync();
        this.syncRefractionBackdrop();
      } else {
        this.stopBackdropSync();
        this.clearRefractionBackdrop();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.stopBackdropSync();
    });
  }

  private setStyleProperty(name: string, value: string): void {
    if (!this.isBrowser) {
      return;
    }

    this.renderer.setStyle(this.elementRef.nativeElement, name, value, RendererStyleFlags2.DashCase);
  }

  private supportsBackdropFilter(): boolean {
    const css = globalThis.CSS;

    return typeof css?.supports === 'function'
      && (css.supports('backdrop-filter', 'blur(1px)') || css.supports('-webkit-backdrop-filter', 'blur(1px)'));
  }

  private prefersReducedMotion(): boolean {
    const defaultView = this.document.defaultView;

    return typeof defaultView?.matchMedia === 'function'
      && defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private startBackdropSync(): void {
    if (!this.isBrowser || this.backdropSyncActive) {
      return;
    }

    const defaultView = this.document.defaultView;

    if (!defaultView) {
      return;
    }

    const scheduleSync = (): void => this.scheduleBackdropSync();

    defaultView.addEventListener('resize', scheduleSync);
    defaultView.addEventListener('scroll', scheduleSync, true);
    this.backdropSyncCleanup.push(() => defaultView.removeEventListener('resize', scheduleSync));
    this.backdropSyncCleanup.push(() => defaultView.removeEventListener('scroll', scheduleSync, true));

    if (typeof defaultView.ResizeObserver === 'function') {
      this.resizeObserver = new defaultView.ResizeObserver(scheduleSync);
      this.resizeObserver.observe(this.elementRef.nativeElement);
    }

    if (typeof defaultView.MutationObserver === 'function') {
      this.hostStyleObserver = new defaultView.MutationObserver(scheduleSync);
      this.hostStyleObserver.observe(this.elementRef.nativeElement, {
        attributes: true,
        attributeFilter: ['class', 'style'],
      });
    }

    this.backdropSyncActive = true;
  }

  private stopBackdropSync(): void {
    if (!this.isBrowser) {
      return;
    }

    const defaultView = this.document.defaultView;

    if (defaultView && this.backdropSyncFrame !== 0) {
      defaultView.cancelAnimationFrame(this.backdropSyncFrame);
      this.backdropSyncFrame = 0;
    }

    while (this.backdropSyncCleanup.length > 0) {
      this.backdropSyncCleanup.pop()?.();
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.hostStyleObserver?.disconnect();
    this.hostStyleObserver = null;
    this.observedBackdropSource = null;
    this.removeClonedBackdrop();
    this.backdropSyncActive = false;
  }

  private scheduleBackdropSync(): void {
    if (!this.isBrowser || this.backdropSyncFrame !== 0) {
      return;
    }

    const defaultView = this.document.defaultView;

    if (!defaultView) {
      return;
    }

    this.backdropSyncFrame = defaultView.requestAnimationFrame(() => {
      this.backdropSyncFrame = 0;
      this.syncRefractionBackdrop();
    });
  }

  private syncRefractionBackdrop(): void {
    if (!this.isBrowser || !this.isRefractionActive()) {
      return;
    }

    const defaultView = this.document.defaultView;

    if (!defaultView) {
      return;
    }

    const host = this.elementRef.nativeElement;
    const configuredBackdrop = this.resolveConfiguredBackdrop(host);

    if (configuredBackdrop) {
      this.syncClonedBackdrop(configuredBackdrop, host);
      return;
    }

    this.removeClonedBackdrop();
    const backdrop = this.findBackdropSource(host, defaultView);

    if (!backdrop) {
      this.clearRefractionBackdrop();
      return;
    }

    this.observeBackdropSource(backdrop.element);

    const hostStyle = defaultView.getComputedStyle(host);
    const hostRect = host.getBoundingClientRect();
    const backdropRect = backdrop.element.getBoundingClientRect();
    const bleed = this.readPixelValue(hostStyle.getPropertyValue('--lg-refraction-bleed'), 18);
    const x = backdropRect.left - hostRect.left + bleed;
    const y = backdropRect.top - hostRect.top + bleed;

    this.setStyleProperty('--lg-refraction-bg-color', backdrop.style.backgroundColor || 'transparent');
    this.setStyleProperty('--lg-refraction-bg-image', this.backgroundImageOrNone(backdrop.style.backgroundImage));
    this.setStyleProperty('--lg-refraction-bg-position', `${this.formatPixel(x)} ${this.formatPixel(y)}`);
    this.setStyleProperty('--lg-refraction-bg-size', this.resolveBackdropBackgroundSize(backdrop.style.backgroundSize, backdropRect));
    this.setStyleProperty('--lg-refraction-bg-repeat', backdrop.style.backgroundRepeat || 'no-repeat');
    this.setStyleProperty('--lg-refraction-bg-blend-mode', backdrop.style.backgroundBlendMode || 'normal');
  }

  private findBackdropSource(host: HTMLElement, defaultView: Window): { element: HTMLElement; style: CSSStyleDeclaration } | null {
    let candidate = host.parentElement;

    while (candidate) {
      const style = defaultView.getComputedStyle(candidate);

      if (this.hasVisibleBackground(style)) {
        return { element: candidate, style };
      }

      candidate = candidate.parentElement;
    }

    return null;
  }

  private resolveConfiguredBackdrop(host: HTMLElement): HTMLElement | null {
    const configured = this.lgBackdrop();

    if (configured instanceof HTMLElement) {
      return configured === host ? null : configured;
    }

    if (!configured || !this.isBrowser) {
      return null;
    }

    try {
      const source = this.document.querySelector<HTMLElement>(configured);

      return source && source !== host ? source : null;
    } catch {
      return null;
    }
  }

  private syncClonedBackdrop(source: HTMLElement, host: HTMLElement): void {
    const defaultView = this.document.defaultView;

    if (!defaultView) {
      return;
    }

    this.observeBackdropSource(source);

    if (!this.refractionLayer || !this.clonedBackdrop || this.clonedBackdropSource !== source) {
      this.createClonedBackdrop(source, host);
    }

    if (!this.clonedBackdrop) {
      return;
    }

    const hostStyle = defaultView.getComputedStyle(host);
    const hostRect = host.getBoundingClientRect();
    const sourceRect = source.getBoundingClientRect();
    const bleed = this.readPixelValue(hostStyle.getPropertyValue('--lg-refraction-bleed'), 18);
    const x = sourceRect.left - hostRect.left + bleed;
    const y = sourceRect.top - hostRect.top + bleed;

    this.clonedBackdrop.style.left = this.formatPixel(x);
    this.clonedBackdrop.style.top = this.formatPixel(y);
    this.clonedBackdrop.style.width = this.formatPixel(Math.max(1, sourceRect.width));
    this.clonedBackdrop.style.height = this.formatPixel(Math.max(1, sourceRect.height));
    this.coreBackdrop!.style.left = this.formatPixel(x);
    this.coreBackdrop!.style.top = this.formatPixel(y);
    this.coreBackdrop!.style.width = this.formatPixel(Math.max(1, sourceRect.width));
    this.coreBackdrop!.style.height = this.formatPixel(Math.max(1, sourceRect.height));
  }

  private createClonedBackdrop(source: HTMLElement, host: HTMLElement): void {
    this.removeClonedBackdrop();

    const rimLayer = this.document.createElement('div');
    const coreLayer = this.document.createElement('div');
    const rimClone = source.cloneNode(true) as HTMLElement;
    const coreClone = source.cloneNode(true) as HTMLElement;

    rimLayer.className = 'ngx-liquid-glass__source';
    coreLayer.className = 'ngx-liquid-glass__core';
    [rimLayer, coreLayer].forEach((layer) => {
      layer.setAttribute('aria-hidden', 'true');
      layer.setAttribute('inert', '');
    });
    [rimClone, coreClone].forEach((clone) => this.prepareBackdropClone(clone));

    coreLayer.appendChild(coreClone);
    rimLayer.appendChild(rimClone);
    host.append(coreLayer, rimLayer);
    this.refractionLayer = rimLayer;
    this.coreRefractionLayer = coreLayer;
    this.clonedBackdrop = rimClone;
    this.coreBackdrop = coreClone;
    this.clonedBackdropSource = source;
  }

  private sanitizeBackdropClone(clone: HTMLElement): void {
    if (clone.matches('.ngx-liquid-glass, [ngxLiquidGlass]')) {
      clone.remove();
      return;
    }

    clone.removeAttribute('id');
    clone.querySelectorAll('.ngx-liquid-glass, [ngxLiquidGlass]').forEach((glass) => glass.remove());
    clone.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
    clone.querySelectorAll<HTMLElement>('a, button, input, select, textarea, [tabindex]').forEach((element) => {
      element.setAttribute('tabindex', '-1');
      element.setAttribute('aria-hidden', 'true');
    });
  }

  private prepareBackdropClone(clone: HTMLElement): void {
    clone.classList.add('ngx-liquid-glass__backdrop-copy');
    this.sanitizeBackdropClone(clone);
    clone.style.position = 'absolute';
    clone.style.margin = '0';
    clone.style.pointerEvents = 'none';
    clone.style.transform = 'none';
    clone.style.transformOrigin = 'top left';
  }

  private removeClonedBackdrop(): void {
    this.refractionLayer?.remove();
    this.coreRefractionLayer?.remove();
    this.refractionLayer = null;
    this.coreRefractionLayer = null;
    this.clonedBackdrop = null;
    this.coreBackdrop = null;
    this.clonedBackdropSource = null;
  }

  private hasVisibleBackground(style: CSSStyleDeclaration): boolean {
    return this.backgroundImageOrNone(style.backgroundImage) !== 'none'
      || !this.isTransparentColor(style.backgroundColor);
  }

  private backgroundImageOrNone(value: string): string {
    const image = value.trim();

    return image && image !== 'none' ? image : 'none';
  }

  private isTransparentColor(value: string): boolean {
    const color = value.trim().toLowerCase().replace(/\s+/g, '');

    if (!color || color === 'transparent' || color === 'rgba(0,0,0,0)') {
      return true;
    }

    const rgba = color.match(/^rgba?\((.+)\)$/);

    if (!rgba) {
      return false;
    }

    const parts = rgba[1].split(',');
    const alpha = parts[3];

    return alpha !== undefined && Number(alpha) === 0;
  }

  private resolveBackdropBackgroundSize(backgroundSize: string, backdropRect: DOMRect): string {
    const size = backgroundSize.trim();
    const backdropSize = `${this.formatPixel(Math.max(1, backdropRect.width))} ${this.formatPixel(Math.max(1, backdropRect.height))}`;

    if (!size) {
      return backdropSize;
    }

    return this.splitCssLayers(size)
      .map((layer) => this.isAutoBackgroundSize(layer) ? backdropSize : layer.trim())
      .join(', ');
  }

  private isAutoBackgroundSize(value: string): boolean {
    return value
      .split(',')
      .every((layer) => {
        const size = layer.trim();

        return size === 'auto' || size === 'auto auto';
      });
  }

  private splitCssLayers(value: string): string[] {
    const layers: string[] = [];
    let layer = '';
    let depth = 0;
    let quote: '"' | "'" | null = null;
    let escaped = false;

    for (const character of value) {
      if (escaped) {
        layer += character;
        escaped = false;
        continue;
      }

      if (character === '\\') {
        layer += character;
        escaped = true;
        continue;
      }

      if (quote) {
        layer += character;

        if (character === quote) {
          quote = null;
        }

        continue;
      }

      if (character === '"' || character === "'") {
        layer += character;
        quote = character;
        continue;
      }

      if (character === '(') {
        depth += 1;
        layer += character;
        continue;
      }

      if (character === ')') {
        depth = Math.max(0, depth - 1);
        layer += character;
        continue;
      }

      if (character === ',' && depth === 0) {
        layers.push(layer);
        layer = '';
        continue;
      }

      layer += character;
    }

    layers.push(layer);

    return layers;
  }

  private observeBackdropSource(source: HTMLElement): void {
    if (!this.resizeObserver || this.observedBackdropSource === source) {
      return;
    }

    if (this.observedBackdropSource) {
      this.resizeObserver.unobserve(this.observedBackdropSource);
    }

    this.resizeObserver.observe(source);
    this.observedBackdropSource = source;
  }

  private clearRefractionBackdrop(): void {
    this.removeClonedBackdrop();
    this.setStyleProperty('--lg-refraction-bg-color', 'transparent');
    this.setStyleProperty('--lg-refraction-bg-image', 'none');
    this.setStyleProperty('--lg-refraction-bg-position', '0 0');
    this.setStyleProperty('--lg-refraction-bg-size', 'auto');
    this.setStyleProperty('--lg-refraction-bg-repeat', 'no-repeat');
    this.setStyleProperty('--lg-refraction-bg-blend-mode', 'normal');
  }

  private readPixelValue(value: string, fallback: number): number {
    const pixels = Number.parseFloat(value);

    return Number.isFinite(pixels) ? pixels : fallback;
  }

  private formatPixel(value: number): string {
    return `${Math.round(value * 100) / 100}px`;
  }

  private filterUrlFor(intensity: LiquidGlassIntensity): string {
    if (intensity === 'subtle') {
      return 'url("#ngx-liquid-glass-filter-subtle")';
    }

    if (intensity === 'vision') {
      return 'url("#ngx-liquid-glass-filter-vision")';
    }

    return 'url("#ngx-liquid-glass-filter")';
  }

  private normalizeIntensity(value: LiquidGlassIntensity): LiquidGlassIntensity {
    return value in LIQUID_GLASS_PRESETS ? value : 'vivid';
  }

  private normalizeEdgeEffect(value: LiquidGlassEdgeEffect): LiquidGlassEdgeEffect {
    return value === 'none' || value === 'prismatic' || value === 'white' ? value : 'white';
  }

  private normalizeRefractionMode(value: LiquidGlassRefractionMode): LiquidGlassRefractionMode {
    return value === 'fluid' || value === 'lens' ? value : 'lens';
  }

  private coerceRadius(value: number): number {
    const radius = Number(value);

    return Number.isFinite(radius) ? Math.max(0, radius) : 20;
  }
}
