import { TestBed } from '@angular/core/testing';
import { LiquidGlassFilterService } from './liquid-glass-filter.service';

describe(LiquidGlassFilterService.name, () => {
  afterEach(() => {
    document.querySelectorAll('[data-ngx-liquid-glass-styles], [data-ngx-liquid-glass-filter]').forEach((node) => node.remove());
    TestBed.resetTestingModule();
  });

  it('injects the SVG filter only once for multiple activations', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(LiquidGlassFilterService);

    service.ensureFilter();
    service.ensureFilter();

    expect(document.body.querySelectorAll('[data-ngx-liquid-glass-filter]').length).toBe(1);
    expect(document.getElementById('ngx-liquid-glass-filter')).not.toBeNull();
    expect(document.getElementById('ngx-liquid-glass-filter-subtle')).not.toBeNull();
    expect(document.getElementById('ngx-liquid-glass-filter-vision')).not.toBeNull();
  });

  it('uses visible displacement scales for the injected filters', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(LiquidGlassFilterService);

    service.ensureFilter();

    expect(displacementScale('ngx-liquid-glass-filter-subtle')).toBe('20');
    expect(displacementScale('ngx-liquid-glass-filter')).toBe('42');
    expect(displacementScale('ngx-liquid-glass-filter-vision')).toBe('56');
  });
});

function displacementScale(id: string): string | null {
  return document.getElementById(id)
    ?.querySelector('feDisplacementMap')
    ?.getAttribute('scale') ?? null;
}
