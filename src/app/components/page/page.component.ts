import {
    AfterContentInit,
    Component,
    computed,
    ElementRef,
    inject,
    input,
    viewChild,
} from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';

import { AlbumSettings, Page, ShiftDirection } from '../../../types';
import { ConfigService } from '../../services/config.service';
import { TemplatesComponent } from '../templates/templates.component';
import { PhotoComponent } from '../photo/photo.component';
import { PageSettingsComponent } from '../page-settings/page-settings.component';
import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu';

@Component({
    selector: 'app-page',
    imports: [PhotoComponent, CdkMenu, CdkMenuTrigger, PageSettingsComponent],
    templateUrl: './page.component.html',
    styleUrl: './page.component.scss'
})
export class PageComponent implements AfterContentInit {
    page = input.required<Page>();
    pageIndex = input.required<number>();
    pagesLength = input.required<number>();
    dialog = inject(Dialog);
    pageHeight = 400;
    shiftOptions: ShiftDirection[] = ['◀️', '▶️'];
    pageExportDiv =
        viewChild.required<ElementRef<HTMLElement>>('pageExportDiv');

    constructor(private configService: ConfigService) {}

    ngAfterContentInit(): void {
        this.configService.addPageDivElement(this.pageExportDiv());
    }

    pageHeightInCm = computed(() => {
        return (
            this.page().format?.height ||
            this.configService.album()!.settings.format.height
        );
    });

    pageWidthInCm = computed(() => {
        return (
            this.page().format?.width ||
            this.configService.album()!.settings.format.width
        );
    });

    pageWidth = computed(() => {
        const proportion =
            Number(this.pageWidthInCm()) / Number(this.pageHeightInCm());
        return this.pageHeight * proportion + 'px';
    });

    gap = computed(() => {
        const gapInCm =
            this.page().gap ?? this.configService.album()!.settings.gap;

        return (
            (this.pageHeight * Number(gapInCm)) /
                Number(this.pageHeightInCm()) +
            'px'
        );
    });

    getPadding(position: string): string {
        const posStr = position.charAt(0).toUpperCase() + position.slice(1);
        const paddingPos = `padding${posStr}`;
        const padding =
            this.page()[paddingPos as keyof Page] ??
            this.configService.album()!.settings[
                paddingPos as keyof AlbumSettings
            ];

        return (
            (this.pageHeight * Number(padding)) /
                Number(this.pageHeightInCm()) +
            'px'
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

    shiftPagePosition(direction: ShiftDirection) {
        this.configService.shiftPagePosition({
            pageIndex: this.pageIndex(),
            direction,
        });
    }

    isShiftPageDisabled(direction: ShiftDirection, pageIndex: number) {
        return (
            (direction === '◀️' && pageIndex === 0) ||
            (direction === '▶️' && pageIndex === this.pagesLength() - 1)
        );
    }

    downloadPage() {
        this.configService.downloadAlbumPage(
            this.pageExportDiv(),
            `${this.configService.album()!.name}-${this.pageIndex() + 1}.png`,
        );
    }

    trackByFn(i: number) {
        return i;
    }
}
