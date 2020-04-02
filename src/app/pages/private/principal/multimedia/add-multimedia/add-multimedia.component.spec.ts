import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMultimediaComponent } from './add-multimedia.component';

describe('AddMultimediaComponent', () => {
  let component: AddMultimediaComponent;
  let fixture: ComponentFixture<AddMultimediaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMultimediaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMultimediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
