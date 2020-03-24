import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HowIsEconomyComponent } from './how-is-economy.component';

describe('InvestmentStrategiesComponent', () => {
  let component: HowIsEconomyComponent;
  let fixture: ComponentFixture<HowIsEconomyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HowIsEconomyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HowIsEconomyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
