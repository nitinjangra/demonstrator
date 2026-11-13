import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom, of } from 'rxjs';
import type { Observable } from 'rxjs';
import {
  UnsavedChangesDialogComponent,
  UnsavedChangesDialogService,
} from './unsaved-changes-dialog.component';

describe('UnsavedChangesDialogComponent', () => {
  let fixture: ComponentFixture<UnsavedChangesDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<UnsavedChangesDialogComponent>>;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj<MatDialogRef<UnsavedChangesDialogComponent>>('MatDialogRef', [
      'close',
    ]);
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialog.open.and.returnValue({ afterClosed: () => of(false) } as never);

    await TestBed.configureTestingModule({
      imports: [UnsavedChangesDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UnsavedChangesDialogComponent);
    fixture.detectChanges();
  });

  it('shows a generic warning with an accessible close button and keep-editing and discard choices', () => {
    expect(fixture.nativeElement.textContent).toContain('Unsaved changes');
    expect(fixture.nativeElement.textContent).toContain(
      'If you leave this page, your changes will be lost.',
    );
    expect(fixture.nativeElement.textContent).toContain('Keep editing');
    expect(fixture.nativeElement.textContent).toContain('Discard changes');
    const closeButton = fixture.nativeElement.querySelector(
      'button[aria-label="Close dialog and keep editing"]',
    ) as HTMLButtonElement;
    expect(closeButton).not.toBeNull();
    expect(closeButton.getAttribute('aria-label')).toBe('Close dialog and keep editing');
  });

  it('returns false for keep editing and true for discard', () => {
    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[1].click();
    expect(dialogRef.close).toHaveBeenCalledOnceWith(false);

    buttons[2].click();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('skips the dialog when there are no unsaved changes', () => {
    expect(TestBed.inject(UnsavedChangesDialogService).confirmIfNeeded(false)).toBeTrue();
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('opens the shared dialog and resolves false when the user keeps editing', async () => {
    const result = TestBed.inject(UnsavedChangesDialogService).confirmIfNeeded(true);

    expect(await firstValueFrom(result as Observable<boolean>)).toBeFalse();
    expect(dialog.open).toHaveBeenCalledWith(
      UnsavedChangesDialogComponent,
      jasmine.objectContaining({ ariaLabel: 'Unsaved changes', disableClose: true }),
    );
  });
});
