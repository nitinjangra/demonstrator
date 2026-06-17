import { AnnouncementsApiService } from './announcements-api.service';
import { TestBed } from '@angular/core/testing';
import { mockAnnouncements } from '../../../shared/mocks/mock-announcements';
describe('AnnouncementsApiService', () => {
  let service: AnnouncementsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnnouncementsApiService],
    });
    service = TestBed.inject(AnnouncementsApiService);
  });

  it('should return an observable of mock announcements', (done) => {
    const result = service.getAnnouncements();

    result.subscribe((value) => {
      expect(value).toEqual(mockAnnouncements);
      done();
    });
  });
});
