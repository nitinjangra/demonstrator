import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Dashboard] }).compileComponents();
    fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
  });

  it('should render the dashboard heading and overview placeholder', () => {
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Dashboard');
    expect(fixture.nativeElement.querySelector('main')?.textContent).toContain(
      'Your dashboard overview will appear here.',
    );
  });
});
