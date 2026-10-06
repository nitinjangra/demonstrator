import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalHeaderComponent } from './global-header';

describe('Globalheader', () => {
  let component: GlobalHeaderComponent;
  let fixture: ComponentFixture<GlobalHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalHeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should render its brand and theme toggle without the disabled menu', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.global-header-brand').textContent.trim()).toBe(
      'Demonstrator',
    );
    expect(fixture.nativeElement.querySelector('app-theme-toggle')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Open navigation menu"]')).toBeNull();
    expect(component.canShowHamburgerMenu).toBeFalse();
  });
});
