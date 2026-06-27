import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Globalheader } from './global-header';

describe('Globalheader', () => {
  let component: Globalheader;
  let fixture: ComponentFixture<Globalheader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Globalheader],
    }).compileComponents();

    fixture = TestBed.createComponent(Globalheader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
