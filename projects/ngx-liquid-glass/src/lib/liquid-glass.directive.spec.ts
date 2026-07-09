import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxLiquidGlassDirective } from './liquid-glass.directive';
import { LiquidGlassEdgeEffect, LiquidGlassIntensity, LiquidGlassRefractionMode } from './liquid-glass.types';

@Component({
  standalone: true,
  imports: [NgxLiquidGlassDirective],
  template: `
    <div #backdrop id="backdrop" style="background-image: linear-gradient(90deg, black, white); background-color: rgb(12, 20, 30);">
      <p class="backdrop-copy">Refracted source content</p>
      <div
        id="glass"
        ngxLiquidGlass
        [lgIntensity]="intensity"
        [lgRadius]="radius"
        [lgTint]="tint"
        [lgRefraction]="refraction"
        [lgBackdrop]="useClone ? backdrop : null"
        [lgEdgeEffect]="edgeEffect"
        [lgRefractionMode]="refractionMode"
        [lgDisabled]="disabled"
      >
        Glass
      </div>
    </div>
  `,
})
class TestHostComponent {
  intensity: LiquidGlassIntensity = 'vivid';
  radius = 20;
  tint = 'rgba(255,255,255,0.12)';
  refraction = true;
  edgeEffect: LiquidGlassEdgeEffect = 'white';
  refractionMode: LiquidGlassRefractionMode = 'lens';
  useClone = false;
  disabled = false;
}

describe(NgxLiquidGlassDirective.name, () => {
  afterEach(() => {
    cleanupLiquidGlassAssets();
    TestBed.resetTestingModule();
  });

  it('applies CSS custom properties for each intensity preset', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const host = glassElement(fixture.nativeElement);
    expect(host.style.getPropertyValue('--lg-blur')).toBe('22px');
    expect(host.style.getPropertyValue('--lg-saturation')).toBe('175%');
    expect(host.style.getPropertyValue('--lg-displacement-scale')).toBe('42');
    expect(host.style.getPropertyValue('--lg-lens-zoom')).toBe('1.14');
    expect(host.style.getPropertyValue('--lg-surface-opacity')).toBe('0.28');
    expect(host.style.getPropertyValue('--lg-edge-width')).toBe('1.5px');
    expect(host.style.getPropertyValue('--lg-filter-url')).toBe('url("#ngx-liquid-glass-filter")');

    fixture.componentInstance.intensity = 'subtle';
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.style.getPropertyValue('--lg-blur')).toBe('12px');
    expect(host.style.getPropertyValue('--lg-saturation')).toBe('135%');
    expect(host.style.getPropertyValue('--lg-displacement-scale')).toBe('20');
    expect(host.style.getPropertyValue('--lg-filter-url')).toBe('url("#ngx-liquid-glass-filter-subtle")');

    fixture.componentInstance.intensity = 'vision';
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.style.getPropertyValue('--lg-blur')).toBe('34px');
    expect(host.style.getPropertyValue('--lg-saturation')).toBe('215%');
    expect(host.style.getPropertyValue('--lg-displacement-scale')).toBe('56');
    expect(host.style.getPropertyValue('--lg-filter-url')).toBe('url("#ngx-liquid-glass-filter-vision")');
  });

  it('copies the nearest visible backdrop into the refraction layer', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const host = glassElement(fixture.nativeElement);
    expect(host.style.getPropertyValue('--lg-refraction-bg-image')).toContain('linear-gradient');
    expect(host.style.getPropertyValue('--lg-refraction-bg-color')).toBe('rgb(12, 20, 30)');
    expect(host.style.getPropertyValue('--lg-refraction-bg-size')).not.toBe('auto');
  });

  it('applies the configured lens edge effect', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.edgeEffect = 'prismatic';
    fixture.detectChanges();
    await fixture.whenStable();

    const host = glassElement(fixture.nativeElement);
    expect(host.getAttribute('data-lg-edge-effect')).toBe('prismatic');

    fixture.componentInstance.edgeEffect = 'none';
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.getAttribute('data-lg-edge-effect')).toBe('none');
  });

  it('applies the configured refraction mode', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.refractionMode = 'fluid';
    fixture.detectChanges();
    await fixture.whenStable();

    expect(glassElement(fixture.nativeElement).getAttribute('data-lg-refraction-mode')).toBe('fluid');
  });

  it('clones an explicitly supplied DOM backdrop for real content refraction', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.useClone = true;
    fixture.detectChanges();
    await fixture.whenStable();

    const host = glassElement(fixture.nativeElement);
    const source = host.querySelector<HTMLElement>('.ngx-liquid-glass__source');

    expect(host.classList).toContain('ngx-liquid-glass--clone-refraction');
    expect(source).not.toBeNull();
    expect(source?.textContent).toContain('Refracted source content');
    expect(source?.querySelector('#glass')).toBeNull();
    expect(host.querySelector<HTMLElement>('.ngx-liquid-glass__core')?.textContent).toContain('Refracted source content');
  });

  it('uses the fallback class when backdrop-filter is unsupported', async () => {
    spyOn(CSS, 'supports').and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const host = glassElement(fixture.nativeElement);
    expect(host.classList).toContain('ngx-liquid-glass');
    expect(host.classList).toContain('ngx-liquid-glass--fallback');
    expect(host.classList).not.toContain('ngx-liquid-glass--refraction');
  });

  it('does not throw or activate DOM effects on the server platform', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    expect(() => {
      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();

      const host = glassElement(fixture.nativeElement);
      expect(host.classList).not.toContain('ngx-liquid-glass');
      expect(host.style.getPropertyValue('--lg-blur')).toBe('');
    }).not.toThrow();
  });
});

function glassElement(root: HTMLElement): HTMLElement {
  return root.querySelector<HTMLElement>('#glass')!;
}

function cleanupLiquidGlassAssets(): void {
  document.querySelectorAll('[data-ngx-liquid-glass-styles], [data-ngx-liquid-glass-filter]').forEach((node) => node.remove());
}
