import { Component, inject, Injectable } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { isObservable, map, Observable, of } from 'rxjs';

export interface CanDeactivatePage {
  canDeactivate?: () => boolean | Observable<boolean>;
}

@Component({
  selector: 'app-unsaved-changes-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="dialog-heading">
      <h2 mat-dialog-title>Unsaved changes</h2>
      <button
        mat-icon-button
        type="button"
        class="dialog-close"
        aria-label="Close dialog and keep editing"
        [mat-dialog-close]="false"
      >
        <mat-icon aria-hidden="true">close</mat-icon>
      </button>
    </div>
    <mat-dialog-content>
      You have unsaved changes. If you leave this page, your changes will be lost.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton type="button" [mat-dialog-close]="false">Keep editing</button>
      <button matButton="filled" type="button" [mat-dialog-close]="true">Discard changes</button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding-inline-end: 1rem;
    }

    .dialog-heading h2[mat-dialog-title] {
      margin: 0;
    }

    .dialog-close {
      flex: 0 0 auto;
    }
  `,
})
export class UnsavedChangesDialogComponent {}

@Injectable({ providedIn: 'root' })
export class UnsavedChangesDialogService {
  private readonly dialog = inject(MatDialog);
  private activePage: CanDeactivatePage | null = null;

  registerActivePage(component: CanDeactivatePage): void {
    this.activePage = component;
  }

  unregisterActivePage(component: CanDeactivatePage): void {
    if (this.activePage === component) this.activePage = null;
  }

  confirmCanDeactivate(component: CanDeactivatePage): boolean | Observable<boolean> {
    return component.canDeactivate?.() ?? true;
  }

  confirmActivePageExit(): Observable<boolean> {
    const result = this.activePage ? this.confirmCanDeactivate(this.activePage) : true;
    return isObservable(result) ? result : of(result);
  }

  confirmIfNeeded(hasUnsavedChanges: boolean): boolean | Observable<boolean> {
    if (!hasUnsavedChanges) return true;

    return this.dialog
      .open(UnsavedChangesDialogComponent, {
        ariaLabel: 'Unsaved changes',
        backdropClass: 'unsaved-changes-dialog-backdrop',
        disableClose: true,
      })
      .afterClosed()
      .pipe(map((confirmed) => confirmed === true));
  }

  warnBeforeUnload(event: BeforeUnloadEvent, hasUnsavedChanges: boolean): void {
    if (!hasUnsavedChanges) return;
    event.preventDefault();
    event.returnValue = true;
  }
}
