import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditIndicatorsContentComponent } from './edit-indicators-content.component';

describe('InvestmentStrategiesComponent', () => {
  let component: EditIndicatorsContentComponent;
  let fixture: ComponentFixture<EditIndicatorsContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditIndicatorsContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditIndicatorsContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
