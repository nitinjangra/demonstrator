import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Announcements } from './announcements';
import { AnnouncementsApiService } from './services/announcements-api.service';
import { mockAnnouncements } from '../../shared/mocks/mock-announcements';
import { CoreTestingModule } from '../../shared/core/core-testing.module';
import { AsyncPipe } from '@angular/common';
describe('Announcements', () => {
  let component: Announcements;
  let fixture: ComponentFixture<Announcements>;
  let announcementsApiServiceSpy: jasmine.SpyObj<AnnouncementsApiService>;

  beforeEach(async () => {
    announcementsApiServiceSpy = jasmine.createSpyObj<AnnouncementsApiService>(
      'AnnouncementsApiService',
      ['getAnnouncements'],
    );

    await TestBed.configureTestingModule({
      imports: [Announcements, CoreTestingModule, AsyncPipe],
      providers: [{ provide: AnnouncementsApiService, useValue: announcementsApiServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(Announcements);
    component = fixture.componentInstance;
    announcementsApiServiceSpy.getAnnouncements.and.returnValue(of(mockAnnouncements));

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set announcements observable', () => {
      const mockAnnouncement = [
        { id: '1', title: 'Test', message: 'Test message', linkUrl: '', description: '' },
      ];
      announcementsApiServiceSpy.getAnnouncements.and.returnValue(of(mockAnnouncement));

      component.ngOnInit();

      expect(component.announcements).toBeDefined();
    });
  });

  describe('handleAnnouncementClick', () => {
    it('should open window with correct parameters', () => {
      spyOn(window, 'open');
      const testUrl = 'https://example.com';

      component.handleAnnouncementClick(testUrl);

      expect(window.open).toHaveBeenCalledWith(testUrl, '_blank', 'noopener,noreferrer');
    });

    it('should handle empty string URL', () => {
      spyOn(window, 'open');

      component.handleAnnouncementClick('');

      expect(window.open).toHaveBeenCalledWith('', '_blank', 'noopener,noreferrer');
    });
  });
});
