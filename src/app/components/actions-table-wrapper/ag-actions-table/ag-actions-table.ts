import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { ActionTableRow } from '../../../shared/interfaces/actions-table.interface';
import { AgTableActionService } from './services/ag-table-action.service';
import { AgTableStateService } from './services/ag-table-state.service';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-ag-grid-actions-table',
  imports: [AgGridAngular, AsyncPipe],
  templateUrl: './ag-actions-table.html',
  styleUrl: './ag-actions-table.scss',
})
export class AgActionsTable implements OnInit {
  private readonly actionService = inject(AgTableActionService);
  readonly state = inject(AgTableStateService);

  rowData: Observable<ActionTableRow[]> = this.state.getRowData();

  colDefs: ColDef<ActionTableRow>[] = [
    { field: 'id' },
    { field: 'entityName' },
    { field: 'dueDate' },
    { field: 'priority' },
  ];

  ngOnInit(): void {
    this.actionService.loadGridData();
  }
}
