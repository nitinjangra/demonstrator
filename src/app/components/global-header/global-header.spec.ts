import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalHeaderComponent } from './global-header';

describe('Globalheader', () => {
  let component: GlobalHeaderComponent;
  let fixture: ComponentFixture<GlobalHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalHeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
