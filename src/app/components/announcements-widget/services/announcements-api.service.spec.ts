import { AnnouncementsApiService } from './announcements-api.service';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { mockAnnouncements } from '../../../shared/mocks/mock-announcements';
describe('AnnouncementsApiService', () => {
  let service: AnnouncementsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnnouncementsApiService],
    });
    service = TestBed.inject(AnnouncementsApiService);
  });

  it('should return the mock announcements', async () => {
    await expectAsync(firstValueFrom(service.getAnnouncements())).toBeResolvedTo(mockAnnouncements);
  });
});
