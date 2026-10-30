import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

export type FooterStyles = Record<string, string | number>;

@Component({
  selector: 'app-sticky-footer',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './sticky-footer.component.html',
  styleUrl: './sticky-footer.component.scss',
})
export class StickyFooterComponent {
  @Input() fixed = true;
  @Input() customStyles: FooterStyles = {};
}
