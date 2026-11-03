import { FormControl, FormGroup } from '@angular/forms';
import { announcementDateRangeValidator } from './announcement.validators';

describe('announcementDateRangeValidator', () => {
  const validate = (startDate: unknown, endDate: unknown) =>
    announcementDateRangeValidator(
      new FormGroup({
        startDate: new FormControl(startDate),
        endDate: new FormControl(endDate),
      }),
    );

  it('accepts empty optional dates', () => {
    expect(validate(null, null)).toBeNull();
    expect(validate(new Date(2026, 10, 2), null)).toBeNull();
  });

  it('compares Date values and parseable date strings', () => {
    expect(validate(new Date(2026, 10, 3), '2026-11-02')).toEqual({ dateRange: true });
    expect(validate('2026-11-02', new Date(2026, 10, 3))).toBeNull();
    expect(validate(new Date(2026, 10, 2), new Date(2026, 10, 2))).toBeNull();
  });

  it('rejects malformed strings and unexpected non-date values', () => {
    expect(validate('not a date', null)).toEqual({ dateRange: true });
    expect(validate(123, null)).toEqual({ dateRange: true });
    expect(validate(new Date(Number.NaN), null)).toEqual({ dateRange: true });
  });
});
