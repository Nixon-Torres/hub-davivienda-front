import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWordsDialogComponent } from './add-words-dialog.component';

describe('AddWordsDialogComponent', () => {
  let component: AddWordsDialogComponent;
  let fixture: ComponentFixture<AddWordsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddWordsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddWordsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
