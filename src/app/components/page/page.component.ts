import {
    Component,
    computed,
    ElementRef,
    inject,
    input,
    ViewChild,
} from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import domtoimage from 'dom-to-image-more';

import { AlbumSettings, Page } from '../../../types';
import { ConfigService } from '../../services/config.service';
import { TemplatesComponent } from '../templates/templates.component';
import { PhotoComponent } from '../photo/photo.component';

@Component({
    selector: 'app-page',
    standalone: true,
    imports: [PhotoComponent],
    templateUrl: './page.component.html',
    styleUrl: './page.component.scss',
})
export class PageComponent {
    page = input.required<Page>();
    pageIndex = input.required<number>();
    dialog = inject(Dialog);
    pageHeight = 400;

    constructor(private configService: ConfigService) {}

    pageFormat = computed(() => {
        return (
            this.page().format ||
            this.configService.album.getValue()!.settings.format
        );
    });

    pageWidth = computed(() => {
        const { width, height } = this.pageFormat();
        const proportion = Number(width) / Number(height);
        return this.pageHeight * proportion + 'px';
    });

    gap = computed(() => {
        const { height: pageHeightInCm } = this.pageFormat();

        const gapInCm =
            this.page().gap ||
            this.configService.album.getValue()!.settings.gap;

        return (
            (this.pageHeight * Number(gapInCm)) / Number(pageHeightInCm) + 'px'
        );
    });

    getPadding(position: string): string {
        const { height: pageHeightInCm } = this.pageFormat();
        const paddingPos = `padding-${position}`;
        const padding =
            this.page()[paddingPos as keyof Page] ||
            this.configService.album.getValue()!.settings[
                paddingPos as keyof AlbumSettings
            ];

        return (
            (this.pageHeight * Number(padding)) / Number(pageHeightInCm) + 'px'
        );
    }

    padding = computed(() => {
        return `${this.getPadding('top')} ${this.getPadding('right')} ${this.getPadding('bottom')} ${this.getPadding('left')}`;
    });

    openTemplateDialog() {
        const dialogRef: DialogRef<string, TemplatesComponent> =
            this.dialog.open(TemplatesComponent, {
                minWidth: '600px',
                data: this.configService.templates(),
            });

        dialogRef.closed.subscribe((template: string | undefined) => {
            if (template) {
                this.changePageTemplate(template);
            }
        });
    }

    changePageTemplate(template: string) {
        if (this.page().template !== template) {
            this.configService.changePageTemplate({
                pageIndex: this.pageIndex(),
                template,
            });
        }
    }

    removePage(): void {
        this.configService.removePage(this.pageIndex());
    }

    shiftPagePosition(shift: '◀️' | '▶️') {
        this.configService.shiftPagePosition({
            pageIndex: this.pageIndex(),
            shift,
        });
    }

    @ViewChild('captureDiv', { static: false }) captureDiv!: ElementRef;

    capture() {
        const element = this.captureDiv.nativeElement;

        // Set width and height directly for high-resolution output
        domtoimage
            .toPng(element, {
                width: 3550, // Desired output width in pixels
                height: 3550, // Desired output height in pixels
                style: {
                    transform: 'scale(8.87)', // 3550 / 400 = 8.87 (scaling factor)
                    transformOrigin: 'top left',
                },
            })
            .then((dataUrl: string) => {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'high-resolution-capture.png';
                link.click();
            })
            .catch((error: any) => {
                console.error('Failed to capture image', error);
            });
    }
}
