import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import {
    MovePageDialogComponent,
    MovePageDialogData,
} from './move-page-dialog.component';
import { Page } from '../../../types';

describe('MovePageDialogComponent', () => {
    let component: MovePageDialogComponent;
    let fixture: ComponentFixture<MovePageDialogComponent>;
    let dialogRefSpy: jasmine.SpyObj<DialogRef<number>>;

    const mockPages: Page[] = [
        { template: '1-1-1-1-1', photos: [] },
        { template: '2-1-1-2-0', photos: [] },
        { template: '3-1-1-3-0', photos: [] },
    ];

    const mockData: MovePageDialogData = {
        pages: mockPages,
        currentIndex: 1,
    };

    beforeEach(async () => {
        dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);

        await TestBed.configureTestingModule({
            imports: [MovePageDialogComponent],
            providers: [
                { provide: DialogRef, useValue: dialogRefSpy },
                { provide: DIALOG_DATA, useValue: mockData },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MovePageDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the current page number in the title', () => {
        const heading: HTMLElement = fixture.nativeElement.querySelector('h3');
        expect(heading.textContent?.trim()).toBe('Move page 2');
    });

    it('should initialize targetIndex to a valid default', () => {
        expect(component.targetIndex()).toBe(0);
    });

    it('should disable Move button when targetIndex equals currentIndex', () => {
        component.targetIndex.set(1);
        fixture.detectChanges();

        const moveBtn: HTMLButtonElement =
            fixture.nativeElement.querySelector('.btn-primary');
        expect(moveBtn.disabled).toBeTrue();
    });

    it('should enable Move button when targetIndex differs from currentIndex', () => {
        const moveBtn: HTMLButtonElement =
            fixture.nativeElement.querySelector('.btn-primary');
        expect(moveBtn.disabled).toBeFalse();
    });

    it('should close dialog without result on Cancel', () => {
        const cancelBtn: HTMLButtonElement =
            fixture.nativeElement.querySelector('.btn-ghost');
        cancelBtn.click();

        expect(dialogRefSpy.close).toHaveBeenCalledWith();
    });

    it('should close dialog with targetIndex on Move', () => {
        component.targetIndex.set(2);
        fixture.detectChanges();

        const moveBtn: HTMLButtonElement =
            fixture.nativeElement.querySelector('.btn-primary');
        moveBtn.click();

        expect(dialogRefSpy.close).toHaveBeenCalledWith(2);
    });
});
