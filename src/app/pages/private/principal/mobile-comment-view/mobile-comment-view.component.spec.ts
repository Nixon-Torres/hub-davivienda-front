import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileCommentViewComponent } from './mobile-comment-view.component';

describe('MobileCommentViewComponent', () => {
  let component: MobileCommentViewComponent;
  let fixture: ComponentFixture<MobileCommentViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileCommentViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileCommentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
