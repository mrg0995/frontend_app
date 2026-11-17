import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { SiteHeaderComponent } from './shared/site-header/site-header.component';
import { LogoComponent } from './shared/logo.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, SiteHeaderComponent, LogoComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
