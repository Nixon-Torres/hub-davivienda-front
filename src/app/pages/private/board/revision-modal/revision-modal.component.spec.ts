import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionModalComponent } from './revision-modal.component';

describe('RevisionModalComponent', () => {
  let component: RevisionModalComponent;
  let fixture: ComponentFixture<RevisionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevisionModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevisionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
