import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
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

    apiServiceSpy.getAnnouncements.and.returnValue(of(mockAnnouncements));
    service = TestBed.inject<AnnouncementsActionService>(AnnouncementsActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load announcements once and expose the shared list', async () => {
    const announcements = await firstValueFrom(service.getAnnouncements());

    expect(announcements).toEqual(mockAnnouncements);
    expect(apiServiceSpy.getAnnouncements).toHaveBeenCalledOnceWith();
  });

  it('keeps added announcements in shared state for later subscribers', async () => {
    service.addAnnouncement({ title: 'Created announcement' });

    const announcements = await firstValueFrom(service.getAnnouncements());

    expect(announcements.map(({ title }) => title)).toContain('Created announcement');
  });

  it('filters future and expired announcements using their active dates', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    service.addAnnouncement({ title: 'Expired', endDate: yesterday });
    service.addAnnouncement({ title: 'Future', startDate: tomorrow });
    service.addAnnouncement({ title: 'Active' });

    const announcements = await firstValueFrom(service.getAnnouncements());

    expect(announcements.map(({ title }) => title)).toEqual([
      ...mockAnnouncements.map(({ title }) => title),
      'Active',
    ]);
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
