import { Component } from '@angular/core';
import { ActionsTable } from './ag-actions-table/ag-actions-table';

@Component({
  selector: 'app-actions-table-wrapper',
  imports: [ActionsTable],
  templateUrl: './actions-table-wrapper.html',
  styleUrl: './actions-table-wrapper.scss',
})
export class ActionsTableWrapper {}
