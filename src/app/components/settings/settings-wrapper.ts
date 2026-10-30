import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-settings-wrapper',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, MatTooltipModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './settings-wrapper.html',
  styleUrl: './settings-wrapper.scss',
})
export class SettingsWrapper {
  isSidebarMinimized = false;

  toggleSidebar(): void {
    this.isSidebarMinimized = !this.isSidebarMinimized;
  }
}
