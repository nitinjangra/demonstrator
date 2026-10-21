import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnouncementSettings } from './announcement-settings';

describe('AnnouncementSettings', () => {
  let fixture: ComponentFixture<AnnouncementSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnnouncementSettings] }).compileComponents();
    fixture = TestBed.createComponent(AnnouncementSettings);
    fixture.detectChanges();
  });

  it('renders the announcement settings heading', () => {
    const heading = fixture.nativeElement.querySelector('h2') as HTMLHeadingElement;

    expect(heading.textContent).toContain('Announcement settings');
    expect(heading.id).toBe('announcement-settings-title');
  });
});
