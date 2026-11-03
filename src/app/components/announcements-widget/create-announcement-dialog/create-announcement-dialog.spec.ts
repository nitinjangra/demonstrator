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

  it('uses the sticky footer with one rem action spacing for add and edit', () => {
    const host = fixture.nativeElement as HTMLElement;
    const footer = host.querySelector('app-sticky-footer footer') as HTMLElement;
    const buttons = footer.querySelectorAll('button');

    expect(footer.classList).not.toContain('sticky-footer--fixed');
    expect(buttons.length).toBe(2);
    expect(getComputedStyle(footer).gap).toBe('16px');
    expect(buttons[1].textContent).toContain('Add announcement');

    fixture.componentRef.setInput('editorData', {
      mode: 'edit',
      announcement: { id: 'edit-me', title: 'Existing', status: 'Published' },
    });
    fixture.detectChanges();

    expect(footer.querySelectorAll('button')[1].textContent).toContain('Save announcement');
  });

  it('keeps the dialog open when the form is invalid', () => {
    fixture.componentInstance.form.controls.title.setValue('   ');

    fixture.componentInstance.submit();

    expect(dialogRefSpy.close).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.controls.title.touched).toBeTrue();
  });

  it('closes with trimmed values, optional dates, and the selected attachment', () => {
    const attachment = new File(['attachment'], 'brief.png', { type: 'image/png' });
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

  it('initializes edit values with present dates and optional fields', () => {
    fixture.componentRef.setInput('editorData', {
      mode: 'edit',
      announcement: {
        id: 'existing',
        title: 'Existing',
        status: 'Published',
        startDate: new Date(2026, 10, 2),
        endDate: new Date(2026, 10, 4),
      },
    });
    fixture.componentInstance.ngOnInit();

    expect(fixture.componentInstance.form.getRawValue()).toEqual(jasmine.objectContaining({
      title: 'Existing',
      description: '',
      linkUrl: '',
      startDate: new Date(2026, 10, 2),
      endDate: new Date(2026, 10, 4),
    }));
  });

  it('clears optional text fields from the result when they contain only whitespace', () => {
    fixture.componentInstance.form.setValue({
      title: 'Maintenance',
      status: 'Draft',
      description: '   ',
      linkUrl: '',
      startDate: null,
      endDate: null,
    });

    fixture.componentInstance.submit();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(jasmine.objectContaining({
      description: undefined,
      linkUrl: undefined,
      startDate: undefined,
      endDate: undefined,
    }));
  });

  it('accepts image attachments and rejects unsupported or oversized files', () => {
    const component = fixture.componentInstance;
    const input = document.createElement('input');
    input.type = 'file';
    const event = (file: File | undefined) => ({
      target: { files: file ? [file] : [], value: 'selected' },
    } as unknown as Event);

    component.onAttachmentSelected(event(new File(['image'], 'photo.jpg', { type: 'image/jpeg' })));
    expect(component.selectedAttachment?.name).toBe('photo.jpg');

    component.onAttachmentSelected(event(new File(['document'], 'notes.pdf', { type: 'application/pdf' })));
    expect(component.selectedAttachment).toBeUndefined();
    expect(component.attachmentError).toContain('JPG or PNG');

    const oversized = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' });
    component.onAttachmentSelected(event(oversized));
    expect(component.attachmentError).toContain('2 MB or smaller');

    component.onAttachmentSelected(event(undefined));
    expect(component.attachmentError).toBeNull();
    expect(component.selectedAttachment).toBeUndefined();
  });

  it('cancels a modal through its dialog ref', () => {
    fixture.componentInstance.cancel();
    expect(dialogRefSpy.close).toHaveBeenCalledOnceWith();
  });
});
