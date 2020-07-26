import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileDetailViewComponent } from './mobile-detail-view.component';

describe('MobileDetailViewComponent', () => {
  let component: MobileDetailViewComponent;
  let fixture: ComponentFixture<MobileDetailViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileDetailViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
