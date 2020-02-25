import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedReportsComponent } from './related-reports.component';

describe('RelatedReportsComponent', () => {
  let component: RelatedReportsComponent;
  let fixture: ComponentFixture<RelatedReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatedReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatedReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
