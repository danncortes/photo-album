import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleSettingsComponent } from './style-settings.component';

describe('StyleSettingsComponent', () => {
    let component: StyleSettingsComponent;
    let fixture: ComponentFixture<StyleSettingsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StyleSettingsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StyleSettingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
