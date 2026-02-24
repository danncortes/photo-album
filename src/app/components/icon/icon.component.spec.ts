import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IconComponent } from './icon.component';

@Component({
    template: `<app-icon [name]="name" [size]="size" />`,
    imports: [IconComponent],
})
class TestHostComponent {
    name: string = 'trash';
    size: string = 'size-6';
}

describe('IconComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        const icon = fixture.debugElement.query(By.directive(IconComponent));
        expect(icon).toBeTruthy();
    });

    it('should render an svg element', () => {
        const svg = fixture.debugElement.query(By.css('svg'));
        expect(svg).toBeTruthy();
        expect(svg.nativeElement.getAttribute('fill')).toBe('none');
        expect(svg.nativeElement.getAttribute('viewBox')).toBe('0 0 24 24');
        expect(svg.nativeElement.getAttribute('stroke-width')).toBe('1.5');
        expect(svg.nativeElement.getAttribute('stroke')).toBe('currentColor');
    });

    it('should apply the size class to the svg', () => {
        const svg = fixture.debugElement.query(By.css('svg'));
        expect(svg.nativeElement.classList.contains('size-6')).toBeTrue();
    });

    it('should render paths for a single-path icon', () => {
        host.name = 'chevron-left';
        fixture.detectChanges();
        const paths = fixture.debugElement.queryAll(By.css('svg path'));
        expect(paths.length).toBe(1);
        expect(paths[0].nativeElement.getAttribute('d')).toBe(
            'M15.75 19.5 8.25 12l7.5-7.5',
        );
    });

    it('should render multiple paths for multi-path icons', () => {
        host.name = 'cog-6-tooth';
        fixture.detectChanges();
        const paths = fixture.debugElement.queryAll(By.css('svg path'));
        expect(paths.length).toBe(2);
    });

    it('should update size when input changes', () => {
        host.size = 'size-4';
        fixture.detectChanges();
        const svg = fixture.debugElement.query(By.css('svg'));
        expect(svg.nativeElement.classList.contains('size-4')).toBeTrue();
    });

    it('should set stroke-linecap and stroke-linejoin on paths', () => {
        const path = fixture.debugElement.query(By.css('svg path'));
        expect(path.nativeElement.getAttribute('stroke-linecap')).toBe('round');
        expect(path.nativeElement.getAttribute('stroke-linejoin')).toBe(
            'round',
        );
    });
});
