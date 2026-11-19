import { Component, input } from '@angular/core';

/**
 * Logo de rejoya: el nombre en minúsculas con un diamante como punto de la «j».
 * Se usa en la cabecera y en el pie de página.
 *
 * Uso:
 *   <app-logo />                 → logo navy, para fondo blanco (cabecera)
 *   <app-logo [claro]="true" />  → logo blanco, para fondo navy (pie)
 */
@Component({
    selector: 'app-logo',
    template: `
        <span class="logo" [class.claro]="claro()">re<span class="j">ȷ<svg class="gema" viewBox="-21 -13 42 34" aria-hidden="true">
        <polygon points="-12,-12 12,-12 20,-4 0,20 -20,-4" fill="var(--color-accent)"/>
        <g fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round" opacity=".85">
            <polyline points="-20,-4 20,-4"/>
            <polyline points="-12,-12 -6,-4 0,20 6,-4 12,-12"/>
            <polyline points="-6,-4 0,-12 6,-4"/>
        </g>
        </svg></span>oya</span>
    `,
    styles: [`
        .logo { font-weight: 800; font-size: 1.85rem; letter-spacing: -.04em; color: var(--color-primary); line-height: 1; }
        .logo.claro { color: #fff; }
        .j { position: relative; display: inline-block; }
        .gema { position: absolute; width: .48em; height: .39em; left: 50%; top: -.06em; transform: translateX(-42%); }
`]
    })
    export class LogoComponent {
    claro = input(false);
}