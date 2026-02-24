import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageSelectComponent } from './page-select.component';
import { Page } from '../../../types';

describe('PageSelectComponent', () => {
    let component: PageSelectComponent;
    let fixture: ComponentFixture<PageSelectComponent>;

    const mockPages: Page[] = [
        { template: '1-1-1-1-1', photos: [] },
        { template: '2-1-1-2-0', photos: [] },
        { template: '3-1-1-3-0', photos: [] },
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PageSelectComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PageSelectComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('pages', mockPages);
        fixture.componentRef.setInput('selectedIndex', 2);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render an option for each page', () => {
        const options = fixture.nativeElement.querySelectorAll('option');
        expect(options.length).toBe(3);
    });

    it('should display 1-based page numbers', () => {
        const options: NodeListOf<HTMLOptionElement> =
            fixture.nativeElement.querySelectorAll('option');
        expect(options[0].textContent?.trim()).toBe('1');
        expect(options[1].textContent?.trim()).toBe('2');
        expect(options[2].textContent?.trim()).toBe('3');
    });

    it('should mark the selected option', () => {
        const options: NodeListOf<HTMLOptionElement> =
            fixture.nativeElement.querySelectorAll('option');
        expect(options[2].selected).toBeTrue();
    });

    it('should disable the option matching disabledIndex', () => {
        fixture.componentRef.setInput('disabledIndex', 1);
        fixture.detectChanges();

        const options: NodeListOf<HTMLOptionElement> =
            fixture.nativeElement.querySelectorAll('option');
        expect(options[1].disabled).toBeTrue();
        expect(options[0].disabled).toBeFalse();
    });

    it('should render the label text', () => {
        fixture.componentRef.setInput('label', 'Move to');
        fixture.detectChanges();

        const label: HTMLLabelElement =
            fixture.nativeElement.querySelector('label');
        expect(label.textContent?.trim()).toBe('Move to');
    });

    it('should emit selectionChange on change', () => {
        spyOn(component.selectionChange, 'emit');

        const select: HTMLSelectElement =
            fixture.nativeElement.querySelector('select');
        select.value = '1';
        select.dispatchEvent(new Event('change'));

        expect(component.selectionChange.emit).toHaveBeenCalledWith(1);
    });
});
