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
    expect(host.querySelector('input[formControlName="startDate"]')).not.toBeNull();
    expect(host.querySelector('input[formControlName="endDate"]')).not.toBeNull();
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
      description: '  Service is unavailable.  ',
      linkUrl: 'https://example.com/maintenance',
      startDate: '2026-11-02',
      endDate: '2026-11-03',
    });
    fixture.componentInstance.selectedAttachment = attachment;

    fixture.componentInstance.submit();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Planned maintenance',
        description: 'Service is unavailable.',
        linkUrl: 'https://example.com/maintenance',
        startDate: new Date(2026, 10, 2),
        endDate: new Date(2026, 10, 3),
        attachment,
      }),
    );
  });

  it('rejects an end date earlier than the start date', () => {
    fixture.componentInstance.form.controls.title.setValue('Maintenance');
    fixture.componentInstance.form.controls.startDate.setValue('2026-11-03');
    fixture.componentInstance.form.controls.endDate.setValue('2026-11-02');

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.form.hasError('dateRange')).toBeTrue();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });
});
