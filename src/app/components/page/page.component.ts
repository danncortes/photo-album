import { Component, ElementRef, inject, input, ViewChild } from '@angular/core';
import domtoimage from 'dom-to-image-more';
import { Page } from '../../../types';
import { ConfigService } from '../../services/config.service';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
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
    baseUrl = input.required();
    pageIndex = input.required<number>();
    dialog = inject(Dialog);

    constructor(private configService: ConfigService) {}

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
