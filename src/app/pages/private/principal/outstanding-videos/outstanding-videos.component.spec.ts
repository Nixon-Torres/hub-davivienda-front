import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {OutstandingVideosComponent} from './outstanding-videos.component';

describe('OutstandingVideosComponent', () => {
    let component: OutstandingVideosComponent;
    let fixture: ComponentFixture<OutstandingVideosComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OutstandingVideosComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OutstandingVideosComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
