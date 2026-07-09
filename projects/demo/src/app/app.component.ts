import { Component, ElementRef, HostListener, signal, viewChild } from '@angular/core';
import {
  LiquidGlassEdgeEffect,
  LiquidGlassIntensity,
  LiquidGlassRefractionMode,
  NgxLiquidGlassDirective,
} from 'ngx-liquid-glass';

interface LensPosition {
  x: number;
  y: number;
}

@Component({
  selector: 'app-root',
  imports: [NgxLiquidGlassDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly intensityOptions: readonly LiquidGlassIntensity[] = ['subtle', 'vivid', 'vision'];
  readonly edgeEffectOptions: readonly LiquidGlassEdgeEffect[] = ['white', 'prismatic', 'none'];
  readonly refractionModeOptions: readonly LiquidGlassRefractionMode[] = ['lens', 'fluid'];
  readonly tintOptions = [
    'rgba(255,255,255,0.18)',
    'rgba(232,240,255,0.22)',
    'rgba(255,239,220,0.18)',
    'rgba(239,232,255,0.2)',
  ];

  readonly intensity = signal<LiquidGlassIntensity>('vivid');
  readonly radius = signal(220);
  readonly tint = signal(this.tintOptions[0]);
  readonly refraction = signal(true);
  readonly edgeEffect = signal<LiquidGlassEdgeEffect>('white');
  readonly refractionMode = signal<LiquidGlassRefractionMode>('lens');
  readonly lensPosition = signal<LensPosition | null>(null);
  readonly isDragging = signal(false);

  private readonly lensScene = viewChild.required<ElementRef<HTMLElement>>('lensScene');
  private activePointerId: number | null = null;
  private dragOffset = { x: 0, y: 0 };
  private dragRadius = { x: 0, y: 0 };

  setIntensity(event: Event): void {
    this.intensity.set((event.target as HTMLSelectElement).value as LiquidGlassIntensity);
  }

  setRadius(event: Event): void {
    this.radius.set(Number((event.target as HTMLInputElement).value));
  }

  setEdgeEffect(event: Event): void {
    this.edgeEffect.set((event.target as HTMLSelectElement).value as LiquidGlassEdgeEffect);
  }

  setRefractionMode(event: Event): void {
    this.refractionMode.set((event.target as HTMLSelectElement).value as LiquidGlassRefractionMode);
  }

  setTint(tint: string): void {
    this.tint.set(tint);
  }

  toggleRefraction(): void {
    this.refraction.update((enabled) => !enabled);
  }

  startLensDrag(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    const lens = event.currentTarget as HTMLElement;
    const lensRect = lens.getBoundingClientRect();

    this.activePointerId = event.pointerId;
    this.dragOffset = {
      x: event.clientX - lensRect.left - lensRect.width / 2,
      y: event.clientY - lensRect.top - lensRect.height / 2,
    };
    this.dragRadius = { x: lensRect.width / 2, y: lensRect.height / 2 };
    lens.setPointerCapture(event.pointerId);
    this.isDragging.set(true);
    event.preventDefault();
  }

  @HostListener('document:pointermove', ['$event'])
  moveLens(event: PointerEvent): void {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    const sceneRect = this.lensScene().nativeElement.getBoundingClientRect();
    const x = this.clamp(event.clientX - sceneRect.left - this.dragOffset.x, this.dragRadius.x, sceneRect.width - this.dragRadius.x);
    const y = this.clamp(event.clientY - sceneRect.top - this.dragOffset.y, this.dragRadius.y, sceneRect.height - this.dragRadius.y);

    this.lensPosition.set({
      x: x / sceneRect.width * 100,
      y: y / sceneRect.height * 100,
    });
  }

  @HostListener('document:pointerup', ['$event'])
  @HostListener('document:pointercancel', ['$event'])
  endLensDrag(event: PointerEvent): void {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    this.activePointerId = null;
    this.isDragging.set(false);
  }

  private clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), maximum);
  }
}
