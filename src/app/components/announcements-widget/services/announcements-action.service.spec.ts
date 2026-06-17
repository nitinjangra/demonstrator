import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CoreTestingModule } from '../../../shared/core/core-testing.module';
import { Announcement } from '../../../shared/interfaces/announcement.interface';
import { AnnouncementsActionService } from './announcements-action.service';
import { AnnouncementsApiService } from './announcements-api.service';

describe('AnnouncementsActionService', () => {
  let service: AnnouncementsActionService;
  let apiServiceSpy: jasmine.SpyObj<AnnouncementsApiService>;

  const mockAnnouncements: Announcement[] = [
    {
      id: '1',
      title: 'Test announcement',
      description: 'A short test announcement.',
      linkUrl: 'https://example.com',
    },
  ];

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj<AnnouncementsApiService>('AnnouncementsApiService', [
      'getAnnouncements',
    ]);

    TestBed.configureTestingModule({
      imports: [CoreTestingModule],
      providers: [{ provide: AnnouncementsApiService, useValue: apiServiceSpy }],
    });

    service = TestBed.inject<AnnouncementsActionService>(AnnouncementsActionService);
    apiServiceSpy.getAnnouncements.and.returnValue(of(mockAnnouncements));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should proxy getAnnouncements to AnnouncementsApiService', (done) => {
    service.getAnnouncements().subscribe((announcements) => {
      expect(announcements).toBe(mockAnnouncements);
      expect(apiServiceSpy.getAnnouncements).toHaveBeenCalledOnceWith();
      done();
    });
  });

  describe('handleAnnouncementClick', () => {
    let windowOpenSpy: jasmine.Spy;

    beforeEach(() => {
      windowOpenSpy = spyOn(window, 'open').and.returnValue(null);
    });

    it('should open a new window when linkUrl is provided', () => {
      const link = 'https://example.com';

      service.handleAnnouncementClick(link);

      expect(windowOpenSpy).toHaveBeenCalledOnceWith(link, '_blank', 'noopener,noreferrer');
    });

    it('should not open a window when linkUrl is empty', () => {
      service.handleAnnouncementClick('');

      expect(windowOpenSpy).not.toHaveBeenCalled();
    });
  });
});
