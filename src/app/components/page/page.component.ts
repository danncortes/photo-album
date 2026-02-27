import {
    AfterContentInit,
    Component,
    computed,
    ElementRef,
    inject,
    Injector,
    input,
    signal,
    viewChild,
} from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu';

import {
    StyleSettings,
    Page,
    ShiftDirection,
    Section,
    Subsection,
    SectionsConfig,
} from '../../../types';
import { PhotoComponent } from '../photo/photo.component';
import { StyleSettingsComponent } from '../style-settings/style-settings.component';
import { AlbumStore } from '../../store/albums.store';
import { TemplatesComponent } from '../templates/templates.component';
import {
    MovePageDialogComponent,
    MovePageDialogData,
} from '../move-page-dialog/move-page-dialog.component';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'app-page',
    imports: [
        PhotoComponent,
        CdkMenu,
        CdkMenuTrigger,
        StyleSettingsComponent,
        IconComponent,
    ],
    templateUrl: './page.component.html',
    styleUrl: './page.component.css',
})
export class PageComponent implements AfterContentInit {
    page = input.required<Page>();
    pageIndex = input.required<number>();
    pagesLength = input.required<number>();
    dialog = inject(Dialog);
    private injector = inject(Injector);
    isPageDownloading = signal(false);
    iconSize = 'size-6';
    readonly albumStore = inject(AlbumStore);

    pageHeight = 400;
    shiftOptions: ShiftDirection[] = [-1, 1];
    pageExportDiv =
        viewChild.required<ElementRef<HTMLElement>>('pageExportDiv');
    menuTrigger = viewChild(CdkMenuTrigger);

    pageSection = computed<{
        section: Section;
        subsection: Subsection | undefined;
        config: SectionsConfig;
    } | null>(() => {
        const config = this.albumStore.activeAlbum()?.sections;
        if (!config?.sections.length) return null;
        const idx = this.pageIndex();
        const section = config.sections.find(
            (s) => idx >= s.from && idx <= s.to,
        );
        if (!section) return null;
        const subsection = section.subsections.find(
            (sub) => idx >= sub.from && idx <= sub.to,
        );
        return { section, subsection, config };
    });

    constructor() {}

    ngAfterContentInit(): void {
        this.albumStore.addPageDivElement(this.pageExportDiv());
    }

    pageHeightInCm = computed(() => {
        return (
            this.page().format?.height ||
            this.albumStore.activeAlbum()!.settings.format.height
        );
    });

    pageWidthInCm = computed(() => {
        return (
            this.page().format?.width ||
            this.albumStore.activeAlbum()!.settings.format.width
        );
    });

    proportion = computed(() => {
        return Number(this.pageWidthInCm()) / Number(this.pageHeightInCm());
    });

    cmToPx(valueInCm: number): number {
        return (this.pageHeight * valueInCm) / Number(this.pageHeightInCm());
    }

    gap = computed(() => {
        const gapInCm =
            this.page().gap ?? this.albumStore.activeAlbum()!.settings.gap;

        return this.cmToPx(Number(gapInCm)) + 'px';
    });

    getPageGridMode(pageIndex: number): string {
        if (!this.pageSection()) {
            return '';
        }

        const { position } = this.pageSection()!.config;

        if (position === 'top') {
            return 'auto-rows-auto grid-rows-[auto_1fr]';
        }

        if (position === 'bottom') {
            return 'auto-rows-auto grid-rows-[1fr_auto]';
        }

        if (pageIndex % 2) {
            return 'auto-columns-auto grid-cols-[1fr_auto]';
        }
        return 'auto-columns-auto grid-cols-[auto_1fr]';
    }

    getSectionClass(pageIndex: number): string {
        const { position } = this.pageSection()!.config;

        if (
            position === 'top' ||
            (position === 'lateral' && !(pageIndex % 2))
        ) {
            return '-order-1';
        }

        return '';
    }

    getPadding(position: string): string {
        const posStr = position.charAt(0).toUpperCase() + position.slice(1);
        const paddingPos = `padding${posStr}`;
        const padding =
            this.page()[paddingPos as keyof Page] ??
            (this.albumStore.activeAlbum()!.settings[
                paddingPos as keyof StyleSettings
            ] ||
                0);

        return this.cmToPx(Number(padding)) + 'px';
    }

    getSectionMargin(margin: number): string {
        return this.cmToPx(margin) + 'px';
    }

    getSectionPadding(config: SectionsConfig): string {
        if (!config.padding) return '0px';
        const base = this.cmToPx(config.padding);
        const extended = this.cmToPx(config.padding + config.padding * 0.8);

        if (config.position === 'top' || config.position === 'bottom') {
            return `${base}px ${extended}px`;
        }

        return `${extended}px ${base}px`;
    }

    getSectionBorderRadius(borderRadius: number): string {
        return this.cmToPx(borderRadius) + 'px';
    }

    getSectionFontSize(fontSize: number): string {
        return this.cmToPx(fontSize) + 'px';
    }

    photoBorderRadius = computed(() => {
        return (
            this.page().photoBorderRadius ??
            this.albumStore.activeAlbum()!.settings.photoBorderRadius ??
            0
        );
    });

    padding = computed(() => {
        return `${this.getPadding('top')} ${this.getPadding('right')} ${this.getPadding('bottom')} ${this.getPadding('left')}`;
    });

    openTemplateDialog() {
        const dialogRef: DialogRef<string, TemplatesComponent> =
            this.dialog.open(TemplatesComponent, {
                minWidth: '600px',
                maxWidth: '90vw',
                injector: this.injector,
                data: this.albumStore.templates(),
                panelClass: [
                    'overflow-y-auto',
                    'p-6',
                    'bg-base-100',
                    'rounded-sm',
                ],
            });

        dialogRef.closed.subscribe((template: string | undefined) => {
            if (template) {
                this.changePageTemplate(template);
            }
        });
    }

    changePageTemplate(template: string) {
        if (this.page().template !== template) {
            this.albumStore.changePageTemplate({
                pageIndex: this.pageIndex(),
                template,
            });
        }
    }

    removePage(): void {
        this.albumStore.removePage(this.pageIndex());
    }

    openMovePageDialog() {
        const data: MovePageDialogData = {
            pages: this.albumStore.activeAlbum()!.pages,
            currentIndex: this.pageIndex(),
        };

        const dialogRef: DialogRef<number, MovePageDialogComponent> =
            this.dialog.open(MovePageDialogComponent, {
                injector: this.injector,
                panelClass: ['p-4', 'bg-base-100', 'rounded-sm', 'shadow-lg'],
                data,
            });

        dialogRef.closed.subscribe((afterIndex: number | undefined) => {
            if (afterIndex !== undefined) {
                this.albumStore.movePage({
                    fromIndex: this.pageIndex(),
                    afterIndex,
                });
            }
        });
    }

    shiftPagePosition(direction: ShiftDirection) {
        this.albumStore.shiftPagePosition({
            pageIndex: this.pageIndex(),
            direction,
        });
    }

    isShiftPageDisabled(direction: ShiftDirection, pageIndex: number) {
        return (
            (direction === -1 && pageIndex === 0) ||
            (direction === 1 && pageIndex === this.pagesLength() - 1)
        );
    }

    async downloadPage() {
        this.isPageDownloading.set(true);
        await this.albumStore.downloadAlbumPage(
            this.pageExportDiv(),
            `${this.albumStore.activeAlbum()!.name}-${this.pageIndex() + 1}.png`,
        );
        this.isPageDownloading.set(false);
    }

    trackByFn(i: number) {
        return i;
    }

    closeSettingsMenu() {
        this.menuTrigger()?.close();
    }
}
