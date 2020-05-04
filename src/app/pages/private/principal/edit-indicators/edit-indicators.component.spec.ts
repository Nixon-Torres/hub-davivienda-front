import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditIndicatorsComponent } from './edit-indicators.component';

describe('InvestmentStrategiesComponent', () => {
  let component: EditIndicatorsComponent;
  let fixture: ComponentFixture<EditIndicatorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditIndicatorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
