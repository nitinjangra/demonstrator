import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AnnouncementsWidgetComponent } from './announcements';
import { mockAnnouncements } from '../../shared/mocks/mock-announcements';
import { CoreTestingModule } from '../../shared/core/core-testing.module';
import { AsyncPipe } from '@angular/common';
import { AnnouncementsActionService } from './services/announcements-action.service';
describe('AnnouncementsWidgetComponent', () => {
  let component: AnnouncementsWidgetComponent;
  let fixture: ComponentFixture<AnnouncementsWidgetComponent>;
  let announcementsActionServiceSpy: jasmine.SpyObj<AnnouncementsActionService>;

  beforeEach(async () => {
    announcementsActionServiceSpy = jasmine.createSpyObj<AnnouncementsActionService>(
      'announcementsActionService',
      ['getAnnouncements', 'handleAnnouncementClick'],
    );

    await TestBed.configureTestingModule({
      imports: [AnnouncementsWidgetComponent, CoreTestingModule, AsyncPipe],
      providers: [{ provide: AnnouncementsActionService, useValue: announcementsActionServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnouncementsWidgetComponent);
    component = fixture.componentInstance;
    fixture.nativeElement.style.display = 'block';
    fixture.nativeElement.style.width = '450px';
    announcementsActionServiceSpy.getAnnouncements.and.returnValue(of(mockAnnouncements));

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set announcements observable', () => {
      const mockAnnouncement = [
        { id: '1', title: 'Test', description: 'Test message', linkUrl: '' },
      ];
      announcementsActionServiceSpy.getAnnouncements.and.returnValue(of(mockAnnouncement));

      component.ngOnInit();

      expect(component.announcements).toBeDefined();
    });
  });

  describe('handleAnnouncementClick', () => {
    it('should delegate clicks with a URL to the action service', () => {
      const testUrl = 'https://example.com';

      component.handleAnnouncementClick(testUrl);

      expect(announcementsActionServiceSpy.handleAnnouncementClick).toHaveBeenCalledWith(testUrl);
    });

    it('should handle empty string URL', () => {
      spyOn(window, 'open');

      component.handleAnnouncementClick('');

      expect(window.open).not.toHaveBeenCalled();
      expect(announcementsActionServiceSpy.handleAnnouncementClick).not.toHaveBeenCalled();
    });
  });

  it('should expand and collapse announcement descriptions accessibly', async () => {
    announcementsActionServiceSpy.getAnnouncements.and.returnValue(of(mockAnnouncements));
    component.ngOnInit();
    fixture.detectChanges();

    const firstDescription = fixture.nativeElement.querySelector(
      '.announcement-content',
    ) as HTMLParagraphElement;
    Object.defineProperties(firstDescription, {
      scrollHeight: { configurable: true, value: 100 },
      clientHeight: { configurable: true, value: 80 },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector(
      '.announcement-expand',
    ) as HTMLButtonElement;
    const descriptionId = button.getAttribute('aria-controls');

    expect(button.textContent.trim()).toBe('Show more');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector(`#${descriptionId}`)).not.toBeNull();

    button.click();
    fixture.detectChanges();

    expect(button.textContent.trim()).toBe('Show less');
    expect(button.getAttribute('aria-expanded')).toBe('true');

    button.click();
    fixture.detectChanges();

    expect(button.textContent.trim()).toBe('Show more');
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('should only show the expand control when a description is truncated', async () => {
    announcementsActionServiceSpy.getAnnouncements.and.returnValue(of(mockAnnouncements));
    component.ngOnInit();
    fixture.detectChanges();

    const releaseDescription = fixture.nativeElement.querySelector(
      '.announcements-list-item:nth-child(2) .announcement-content',
    ) as HTMLParagraphElement;
    Object.defineProperties(releaseDescription, {
      scrollHeight: { configurable: true, value: 40 },
      clientHeight: { configurable: true, value: 40 },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const releaseCard = fixture.nativeElement.querySelector(
      '.announcements-list-item:nth-child(2)',
    ) as HTMLElement;

    expect(releaseCard.querySelector('.announcement-expand')).toBeNull();
    expect(releaseCard.querySelector('.announcement-link')?.textContent).toContain(
      'Read announcement',
    );
  });

  it('should prioritize a detail link and label expansion as a secondary action', async () => {
    announcementsActionServiceSpy.getAnnouncements.and.returnValue(
      of([
        {
          ...mockAnnouncements[0],
          linkUrl: 'https://example.com/release',
        },
      ]),
    );
    component.ngOnInit();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const description = host.querySelector(
      '.announcement-content',
    ) as HTMLParagraphElement;
    Object.defineProperties(description, {
      scrollHeight: { configurable: true, value: 100 },
      clientHeight: { configurable: true, value: 80 },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const card = host.querySelector('.announcements-list-item') as HTMLElement;
    const actions = Array.from(card.querySelectorAll('a, button')).map((action) =>
      action.textContent.trim(),
    );

    expect(actions[0]).toContain('Read announcement');
    expect(actions[1]).toBe('Expand');
  });

  it('should hide expansion when a complete description has no detail page', async () => {
    announcementsActionServiceSpy.getAnnouncements.and.returnValue(
      of([
        {
          id: 'short-description',
          title: 'Maintenance',
          description: 'Maintenance is scheduled this weekend.',
          linkUrl: '',
        },
      ]),
    );
    component.ngOnInit();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const description = host.querySelector(
      '.announcement-content',
    ) as HTMLParagraphElement;
    Object.defineProperties(description, {
      scrollHeight: { configurable: true, value: 40 },
      clientHeight: { configurable: true, value: 40 },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.querySelector('.announcement-expand')).toBeNull();
  });

  it('should render the heading above and outside the announcement panel', () => {
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('.announcements-title') as HTMLHeadingElement;
    const panel = fixture.nativeElement.querySelector('.announcements-panel') as HTMLElement;

    expect(heading.tagName).toBe('H2');
    expect(heading.parentElement).toBe(panel.parentElement);
    expect(heading.nextElementSibling).toBe(panel);
  });
});
