import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ThemeToggleComponent } from '../../shared/components/theme.component';

@Component({
  selector: 'app-global-header',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, ThemeToggleComponent],
  templateUrl: './global-header.html',
  styleUrls: ['./global-header.scss'],
})
export class GlobalHeaderComponent {
  canShowHamburgerMenu = false;
}
