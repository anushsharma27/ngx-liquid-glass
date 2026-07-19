import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { NgxLiquidGlassDirective } from 'ngx-liquid-glass';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgxLiquidGlassDirective],
  template: `
    <main>
      <section ngxLiquidGlass [lgIntensity]="'vivid'" [lgRadius]="24">
        Consumer smoke test
      </section>
    </main>
  `,
})
class AppComponent {}

bootstrapApplication(AppComponent).catch((error: unknown) => console.error(error));
