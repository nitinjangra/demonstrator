import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { CoreTestingModule } from '../../../shared/core/core-testing.module';
import { Announcement } from '../../../shared/interfaces/announcement.interface';
import {
  AnnouncementsActionService,
  filterAnnouncementsForDisplay,
} from './announcements-action.service';
import { AnnouncementsApiService } from './announcements-api.service';

describe('AnnouncementsActionService', () => {
  let service: AnnouncementsActionService;
  let apiServiceSpy: jasmine.SpyObj<AnnouncementsApiService>;

  const mockAnnouncements: Announcement[] = [
    {
      id: '1',
      title: 'Test announcement',
      status: 'Published',
      description: 'A short test announcement.',
      linkUrl: 'https://example.com',
    },
  ];

  beforeEach(() => {
    localStorage.removeItem('announcements');
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

  afterEach(() => localStorage.removeItem('announcements'));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load announcements once and expose the shared list', async () => {
    const announcements = await firstValueFrom(service.getAnnouncements());

    expect(announcements).toEqual(mockAnnouncements);
    expect(apiServiceSpy.getAnnouncements).toHaveBeenCalledOnceWith();
  });

  it('keeps added announcements in shared state for later subscribers', async () => {
    service.addAnnouncement({ title: 'Created announcement', status: 'Published' });

    const announcements = await firstValueFrom(service.getAnnouncements());

    expect(announcements.map(({ title }) => title)).toContain('Created announcement');
  });

  it('caps all stored announcements at ten regardless of status or expiry', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const existing = Array.from({ length: 9 }, (_, index) => ({
      id: `existing-${index}`,
      title: `Existing ${index}`,
      status: index % 2 === 0 ? ('Published' as const) : ('Draft' as const),
      ...(index === 0 ? { endDate: yesterday } : {}),
    }));
    service.saveAnnouncements(existing);

    expect(
      service.addAnnouncement({ title: 'Tenth announcement', status: 'Published' }),
    ).toBeTrue();
    expect(service.canAddAnnouncement).toBeFalse();
    expect(
      service.addAnnouncement({ title: 'Eleventh announcement', status: 'Draft' }),
    ).toBeFalse();

    const allAnnouncements = await firstValueFrom(service.getAllAnnouncements());
    expect(allAnnouncements.length).toBe(10);
    expect(allAnnouncements.map(({ title }) => title)).not.toContain('Eleventh announcement');
  });

  it('shows only Published announcements in the active feed', async () => {
    service.addAnnouncement({ title: 'Draft notice', status: 'Draft' });
    service.addAnnouncement({ title: 'Scheduled notice', status: 'Scheduled' });
    service.addAnnouncement({ title: 'Published notice', status: 'Published' });

    const announcements = await firstValueFrom(service.getAnnouncements());

    expect(announcements.map(({ title, status }) => ({ title, status }))).toEqual([
      { title: 'Test announcement', status: 'Published' },
      { title: 'Published notice', status: 'Published' },
    ]);
  });

  it('does not expose Draft announcements in the active feed', async () => {
    service.addAnnouncement({ title: 'Draft notice', status: 'Draft' });

    const announcements = await firstValueFrom(service.getAnnouncements());

    expect(announcements.map(({ title }) => title)).not.toContain('Draft notice');
  });

  it('exposes and persists Draft announcements in the complete store', async () => {
    service.addAnnouncement({ title: 'Draft notice', status: 'Draft' });

    const allAnnouncements = await firstValueFrom(service.getAllAnnouncements());
    const homeAnnouncements = await firstValueFrom(service.getAnnouncements());

    expect(allAnnouncements.map(({ title }) => title)).toContain('Draft notice');
    expect(homeAnnouncements.map(({ title }) => title)).not.toContain('Draft notice');
    const savedTitles = (
      JSON.parse(localStorage.getItem('announcements') ?? '[]') as Announcement[]
    ).map(({ title }) => title);
    expect(savedTitles).toEqual(allAnnouncements.map(({ title }) => title));
  });

  it('filters expired and non-published announcements from the visible feed', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    service.addAnnouncement({ title: 'Expired', endDate: yesterday, status: 'Published' });
    service.addAnnouncement({ title: 'Future', startDate: tomorrow, status: 'Published' });
    service.addAnnouncement({ title: 'Scheduled', status: 'Scheduled' });
    service.addAnnouncement({ title: 'Active', status: 'Published' });

    const announcements = await firstValueFrom(service.getAnnouncements());

    expect(announcements.map(({ title }) => title)).toEqual([
      ...mockAnnouncements.map(({ title }) => title),
      'Active',
    ]);
  });

  it('keeps published announcements hidden until their start date', async () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    service.saveAnnouncements([
      { id: 'future-start', title: 'Starts tomorrow', status: 'Published', startDate: tomorrow },
      { id: 'starts-today', title: 'Starts today', status: 'Published', startDate: today },
      {
        id: 'already-started',
        title: 'Already started',
        status: 'Published',
        startDate: yesterday,
      },
    ]);

    const announcements = await firstValueFrom(service.getAnnouncements());

    expect(announcements.map(({ id }) => id)).toEqual(['starts-today', 'already-started']);
  });

  it('applies inclusive start and end date boundaries to the active feed', () => {
    const now = new Date(2026, 10, 3, 14, 30);
    const announcements: Announcement[] = [
      {
        id: 'starts-today',
        title: 'Starts today',
        status: 'Published',
        startDate: new Date(2026, 10, 3),
      },
      {
        id: 'ends-today',
        title: 'Ends today',
        status: 'Published',
        endDate: new Date(2026, 10, 3),
      },
      {
        id: 'starts-tomorrow',
        title: 'Starts tomorrow',
        status: 'Published',
        startDate: new Date(2026, 10, 4),
      },
      {
        id: 'ended-yesterday',
        title: 'Ended yesterday',
        status: 'Published',
        endDate: new Date(2026, 10, 2),
      },
    ];

    expect(filterAnnouncementsForDisplay(announcements, now).map(({ id }) => id)).toEqual([
      'starts-today',
      'ends-today',
    ]);
  });

  it('does not persist temporary object URLs for uploaded attachments', async () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:temporary-attachment');
    const attachment = new File(['image'], 'brief.png', { type: 'image/png' });

    service.addAnnouncement({ title: 'With attachment', status: 'Published', attachment });

    const saved = JSON.parse(localStorage.getItem('announcements') ?? '[]') as Announcement[];
    expect(saved[1].attachmentUrl).toBeUndefined();
    expect(saved[1].attachmentName).toBeUndefined();
    expect((await firstValueFrom(service.getAllAnnouncements()))[1].attachmentUrl).toBe(
      'blob:temporary-attachment',
    );
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
