import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailComponent } from './thumbnail.component';

describe('ThumbnailComponent', () => {
    let component: ThumbnailComponent;
    let fixture: ComponentFixture<ThumbnailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ThumbnailComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ThumbnailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
