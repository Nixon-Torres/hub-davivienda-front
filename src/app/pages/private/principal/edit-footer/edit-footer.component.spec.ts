import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFooterComponent } from './edit-book.component';

describe('InvestmentStrategiesComponent', () => {
  let component: EditFooterComponent;
  let fixture: ComponentFixture<EditFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
