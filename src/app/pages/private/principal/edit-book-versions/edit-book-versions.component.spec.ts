import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBookVersionsComponent } from './edit-book-versions.component';

describe('InvestmentStrategiesComponent', () => {
  let component: EditBookVersionsComponent;
  let fixture: ComponentFixture<EditBookVersionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBookVersionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBookVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
