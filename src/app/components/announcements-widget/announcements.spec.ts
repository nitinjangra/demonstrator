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
    it('should open window with correct parameters', () => {
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
});
