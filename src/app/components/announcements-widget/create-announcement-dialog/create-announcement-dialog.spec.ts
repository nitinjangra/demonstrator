import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { EMPTY } from 'rxjs';
import { CreateAnnouncementDialogComponent } from './create-announcement-dialog';

describe('CreateAnnouncementDialogComponent', () => {
  let fixture: ComponentFixture<CreateAnnouncementDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CreateAnnouncementDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj<MatDialogRef<CreateAnnouncementDialogComponent>>(
      'MatDialogRef',
      ['close', 'backdropClick', 'keydownEvents'],
    );
    dialogRefSpy.backdropClick.and.returnValue(EMPTY);
    dialogRefSpy.keydownEvents.and.returnValue(EMPTY);

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
    expect(host.querySelector('mat-select[formControlName="status"]')).toBeNull();
    expect(host.querySelector('input[formControlName="startDate"]')).not.toBeNull();
    expect(host.querySelector('input[formControlName="endDate"]')).not.toBeNull();
    expect(host.querySelector('input[type="file"]')).not.toBeNull();
  });

  it('uses the sticky footer with one rem action spacing for add and edit', () => {
    const host = fixture.nativeElement as HTMLElement;
    const footer = host.querySelector('app-sticky-footer footer') as HTMLElement;
    const buttons = footer.querySelectorAll('button');

    expect(footer.classList).not.toContain('sticky-footer--fixed');
    expect(buttons.length).toBe(3);
    expect(getComputedStyle(footer).gap).toBe('16px');
    expect(footer.style.backgroundColor).toBe('transparent');
    expect(buttons[1].textContent).toContain('Save as draft');
    expect(buttons[2].textContent).toContain('Save and publish');

    fixture.componentRef.setInput('editorData', {
      mode: 'edit',
      announcement: { id: 'edit-me', title: 'Existing', status: 'Published' },
    });
    fixture.detectChanges();

    expect(footer.querySelectorAll('button')[2].textContent).toContain('Save and publish');
  });

  it('keeps the dialog open when the form is invalid', () => {
    fixture.componentInstance.form.controls.title.setValue('   ');

    fixture.componentInstance.submit();

    expect(dialogRefSpy.close).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.controls.title.touched).toBeTrue();
  });

  it('closes with trimmed values, optional dates, and the selected attachment', () => {
    const attachment = new File(['attachment'], 'brief.png', { type: 'image/png' });
    const startDate = dateInFuture(2, 15, 30);
    const endDate = dateInFuture(3, 9, 45);
    fixture.componentInstance.form.setValue({
      title: '  Planned maintenance  ',
      status: 'Draft',
      description: '  Service is unavailable.  ',
      linkUrl: 'https://example.com/maintenance',
      startDate,
      endDate,
    });
    fixture.componentInstance.selectedAttachment = attachment;

    fixture.componentInstance.submit();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Planned maintenance',
        status: 'Draft',
        description: 'Service is unavailable.',
        linkUrl: 'https://example.com/maintenance',
        startDate: dateOnly(startDate),
        endDate: dateOnly(endDate),
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
    const startDate = dateInFuture(2, 15, 30);
    const endDate = dateInFuture(3, 9, 45);
    fixture.componentInstance.form.controls.title.setValue('Maintenance');
    fixture.componentInstance.form.controls.startDate.setValue(startDate);
    fixture.componentInstance.form.controls.endDate.setValue(endDate);

    fixture.componentInstance.submit();

    const result = dialogRefSpy.close.calls.mostRecent().args[0];
    expect(result.status).toBe('Draft');
    expect(result.startDate?.getFullYear()).toBe(startDate.getFullYear());
    expect(result.startDate?.getMonth()).toBe(startDate.getMonth());
    expect(result.startDate?.getDate()).toBe(startDate.getDate());
    expect(result.startDate?.getHours()).toBe(0);
    expect(result.endDate?.getFullYear()).toBe(endDate.getFullYear());
    expect(result.endDate?.getMonth()).toBe(endDate.getMonth());
    expect(result.endDate?.getDate()).toBe(endDate.getDate());
    expect(result.endDate?.getHours()).toBe(0);
  });

  it('rejects an end date earlier than the start date', () => {
    fixture.componentInstance.form.controls.title.setValue('Maintenance');
    fixture.componentInstance.form.controls.startDate.setValue(dateInFuture(3));
    fixture.componentInstance.form.controls.endDate.setValue(dateInFuture(2));

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

  it('shows the current attachment in edit mode and emits an explicit removal request', () => {
    fixture.componentRef.setInput('editorData', {
      mode: 'edit',
      announcement: {
        id: 'with-attachment',
        title: 'Existing announcement',
        status: 'Published',
        attachmentName: 'current-image.png',
        attachmentUrl: 'blob:current-image',
      },
    });
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.existing-attachment')?.textContent).toContain('current-image.png');
    const removeButton = Array.from(host.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Remove attachment'),
    ) as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    expect(host.querySelector('.existing-attachment')).toBeNull();
    fixture.componentInstance.form.controls.title.setValue('Updated announcement');
    fixture.componentInstance.submit();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(
      jasmine.objectContaining({ removeAttachment: true, attachment: undefined }),
    );
  });

  it('cancels a modal through its dialog ref', () => {
    fixture.componentInstance.cancel();
    expect(dialogRefSpy.close).toHaveBeenCalledOnceWith();
  });
});

function dateInFuture(days: number, hours = 0, minutes = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function dateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
