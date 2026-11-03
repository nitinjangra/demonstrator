import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings-overview',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './settings-overview.html',
  styleUrl: './settings-overview.scss',
})
export class SettingsOverview {}
