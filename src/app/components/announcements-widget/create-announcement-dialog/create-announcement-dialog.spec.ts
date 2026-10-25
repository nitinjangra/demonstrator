import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { CreateAnnouncementDialogComponent } from './create-announcement-dialog';

describe('CreateAnnouncementDialogComponent', () => {
  let fixture: ComponentFixture<CreateAnnouncementDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CreateAnnouncementDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj<MatDialogRef<CreateAnnouncementDialogComponent>>(
      'MatDialogRef',
      ['close'],
    );

    await TestBed.configureTestingModule({
      imports: [CreateAnnouncementDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: dialogRefSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAnnouncementDialogComponent);
    fixture.detectChanges();
  });

  it('renders title, date, attachment, and link fields', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('input[formControlName="title"]')).not.toBeNull();
    expect(host.querySelector('input[formControlName="linkUrl"]')).not.toBeNull();
    expect(host.querySelector('mat-select[formControlName="status"]')).not.toBeNull();
    expect(host.querySelector('input[matStartDate]')).not.toBeNull();
    expect(host.querySelector('input[matEndDate]')).not.toBeNull();
    expect(host.querySelector('input[type="file"]')).not.toBeNull();
  });

  it('keeps the dialog open when the form is invalid', () => {
    fixture.componentInstance.form.controls.title.setValue('   ');

    fixture.componentInstance.submit();

    expect(dialogRefSpy.close).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.controls.title.touched).toBeTrue();
  });

  it('closes with trimmed values, optional dates, and the selected attachment', () => {
    const attachment = new File(['attachment'], 'brief.pdf', { type: 'application/pdf' });
    fixture.componentInstance.form.setValue({
      title: '  Planned maintenance  ',
      status: 'Draft',
      description: '  Service is unavailable.  ',
      linkUrl: 'https://example.com/maintenance',
      startDate: new Date(2026, 10, 2),
      endDate: new Date(2026, 10, 3),
    });
    fixture.componentInstance.selectedAttachment = attachment;

    fixture.componentInstance.submit();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Planned maintenance',
        status: 'Draft',
        description: 'Service is unavailable.',
        linkUrl: 'https://example.com/maintenance',
        startDate: new Date(2026, 10, 2),
        endDate: new Date(2026, 10, 3),
        attachment,
      }),
    );
  });

  it('includes the selected status in the creation result', () => {
    fixture.componentInstance.form.controls.title.setValue('Release announcement');
    fixture.componentInstance.form.controls.status.setValue('Published');

    fixture.componentInstance.submit();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: 'Release announcement', status: 'Published' }),
    );
  });

  it('defaults status to Draft and preserves date-only local calendar values', () => {
    const startDate = new Date(2026, 10, 2, 15, 30);
    const endDate = new Date(2026, 10, 3, 9, 45);
    fixture.componentInstance.form.controls.title.setValue('Maintenance');
    fixture.componentInstance.form.controls.startDate.setValue(startDate);
    fixture.componentInstance.form.controls.endDate.setValue(endDate);

    fixture.componentInstance.submit();

    const result = dialogRefSpy.close.calls.mostRecent().args[0];
    expect(result.status).toBe('Draft');
    expect(result.startDate?.getFullYear()).toBe(2026);
    expect(result.startDate?.getMonth()).toBe(10);
    expect(result.startDate?.getDate()).toBe(2);
    expect(result.startDate?.getHours()).toBe(0);
    expect(result.endDate?.getFullYear()).toBe(2026);
    expect(result.endDate?.getMonth()).toBe(10);
    expect(result.endDate?.getDate()).toBe(3);
    expect(result.endDate?.getHours()).toBe(0);
  });

  it('rejects an end date earlier than the start date', () => {
    fixture.componentInstance.form.controls.title.setValue('Maintenance');
    fixture.componentInstance.form.controls.startDate.setValue(new Date(2026, 10, 3));
    fixture.componentInstance.form.controls.endDate.setValue(new Date(2026, 10, 2));

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.form.hasError('dateRange')).toBeTrue();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });
});
