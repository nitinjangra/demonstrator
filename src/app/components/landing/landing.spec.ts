import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Landing } from './landing';
import { WeatherIcon } from '../../shared/constants/icon.const';

describe('Landing', () => {
  let component: Landing;
  let fixture: ComponentFixture<Landing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing],
    }).compileComponents();

    fixture = TestBed.createComponent(Landing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the morning greeting and sun icon', () => {
    spyOn(Date.prototype, 'getHours').and.returnValue(9);

    fixture.detectChanges();

    expect(component.timeGreeting).toBe('Good Morning!!');
    expect(component.greetingIcon).toBe(WeatherIcon.Sun);
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Good Morning!!');
  });

  it('should show the afternoon greeting and cloud icon', () => {
    spyOn(Date.prototype, 'getHours').and.returnValue(14);

    fixture.detectChanges();

    expect(component.timeGreeting).toBe('Good Afternoon!!');
    expect(component.greetingIcon).toBe(WeatherIcon.Cloud);
  });

  it('should show the evening greeting and moon icon', () => {
    spyOn(Date.prototype, 'getHours').and.returnValue(18);

    fixture.detectChanges();

    expect(component.timeGreeting).toBe('Good Evening!!');
    expect(component.greetingIcon).toBe(WeatherIcon.Moon);
  });
});
