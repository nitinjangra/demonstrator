import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StickyFooterComponent } from './sticky-footer.component';

@Component({
  standalone: true,
  imports: [StickyFooterComponent],
  template: `
    <app-sticky-footer [fixed]="true" [customStyles]="footerStyles">
      <button type="button">Save</button>
    </app-sticky-footer>
    <app-sticky-footer><span>Default footer</span></app-sticky-footer>
  `,
})
class StickyFooterTestHost {
  readonly footerStyles = { padding: '1rem' };
}

describe('StickyFooterComponent', () => {
  let fixture: ComponentFixture<StickyFooterTestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StickyFooterTestHost] }).compileComponents();
    fixture = TestBed.createComponent(StickyFooterTestHost);
    fixture.detectChanges();
  });

  it('projects caller content and applies fixed positioning and custom styles', () => {
    const footer = fixture.nativeElement.querySelector('footer') as HTMLElement;

    expect(footer.classList).toContain('sticky-footer--fixed');
    expect(footer.querySelector('button')?.textContent).toContain('Save');
    expect(footer.style.padding).toBe('1rem');
    expect(getComputedStyle(footer).justifyContent).toBe('flex-end');
    expect(getComputedStyle(footer).borderTopStyle).toBe('solid');

    const defaultFooter = fixture.nativeElement.querySelectorAll('app-sticky-footer')[1]
      .querySelector('footer') as HTMLElement;
    expect(getComputedStyle(defaultFooter).paddingTop).toBe('12.8px');
  });
});
