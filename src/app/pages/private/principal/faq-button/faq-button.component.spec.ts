import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqButtonComponent } from './faq-button.component';

describe('FaqButtonComponent', () => {
  let component: FaqButtonComponent;
  let fixture: ComponentFixture<FaqButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
