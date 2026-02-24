import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAlbumFormComponent } from './create-album-form.component';

describe('CreateAlbumFormComponent', () => {
    let component: CreateAlbumFormComponent;
    let fixture: ComponentFixture<CreateAlbumFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CreateAlbumFormComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateAlbumFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
