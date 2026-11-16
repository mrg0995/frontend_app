import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteMenuComponent } from './site-menu.component';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, SiteMenuComponent],
  template: `
    <header class="site-header">
      <div class="container header-content">
        <a class="brand" routerLink="/articulos" aria-label="Segunda Mano, inicio">
          <span class="brand-mark" aria-hidden="true">◆</span>
          <span>Segunda Mano</span>
        </a>
        <app-site-menu />
      </div>
    </header>
  `,
  styles: [`
    .site-header { background: #fff; border-bottom: 1px solid var(--color-border); }
    .header-content { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding-top: .8rem; padding-bottom: .8rem; }
    .brand { display: inline-flex; align-items: center; gap: .6rem; font-weight: 750; font-size: 1.25rem; text-decoration: none; color: var(--color-primary); white-space: nowrap; }
    .brand-mark { color: var(--color-accent); font-size: 1.5rem; }
    @media (max-width: 700px) { .header-content { justify-content: center; } }
  `]
})
export class SiteHeaderComponent {}
