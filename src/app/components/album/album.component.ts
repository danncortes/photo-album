import {
    Component,
    inject,
    Injector,
    OnDestroy,
    OnInit,
    signal,
} from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { PagesComponent } from '../pages/pages.component';
import {
    AddPageComponent,
    AddPageResult,
} from '../add-page/add-page.component';
import { StyleSettingsComponent } from '../style-settings/style-settings.component';
import {
    SectionsDialogComponent,
    SectionsDialogData,
} from '../sections-dialog/sections-dialog.component';
import { AlbumStore } from '../../store/albums.store';
import { SectionsConfig } from '../../../types';
import { DirectoryGalleryComponent } from '../directory-gallery/directory-gallery.component';
import { IconComponent } from '../icon/icon.component';
@Component({
    selector: 'app-album',
    imports: [
        PagesComponent,
        DirectoryGalleryComponent,
        DirectoryGalleryComponent,
        IconComponent,
    ],
    templateUrl: './album.component.html',
    styleUrl: './album.component.css',
    host: {
        class: 'block h-full bg-gray-100',
    },
})
export class AlbumComponent implements OnInit, OnDestroy {
    private dialog = inject(Dialog);
    private injector = inject(Injector);
    readonly albumStore = inject(AlbumStore);
    isDownloadingPages = signal(false);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit() {
        this.route.params.subscribe(async (params) => {
            this.albumStore.getAlbumAndDirectory(params['id']);
        });
    }

    openAddPageDialog() {
        const dialogRef: DialogRef<AddPageResult, AddPageComponent> =
            this.dialog.open(AddPageComponent, {
                minWidth: '600px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                autoFocus: false,
                injector: this.injector,
                data: this.albumStore.templates(),
                panelClass: [
                    'overflow-y-auto',
                    'p-6',
                    'bg-base-100',
                    'rounded-sm',
                ],
            });

        dialogRef.closed.subscribe((result: AddPageResult | undefined) => {
            if (result) {
                this.albumStore.addPage(result.template, result.afterPageIndex);
            }
        });
    }

    openSectionsDialog() {
        const dialogRef: DialogRef<SectionsConfig, SectionsDialogComponent> =
            this.dialog.open(SectionsDialogComponent, {
                minWidth: '600px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                autoFocus: false,
                injector: this.injector,
                data: {
                    sections: this.albumStore.activeAlbum()?.sections,
                    pageCount:
                        this.albumStore.activeAlbum()?.pages?.length ?? 0,
                } as SectionsDialogData,
                panelClass: [
                    'overflow-y-auto',
                    'p-6',
                    'bg-base-100',
                    'rounded-sm',
                ],
            });

        dialogRef.closed.subscribe(
            (result: SectionsConfig | undefined) => {
                if (result) {
                    this.albumStore.updateAlbumSections(result);
                }
            },
        );
    }

    openAlbumSettingsDialog() {
        this.dialog.open(StyleSettingsComponent, {
            minWidth: '400px',
            maxHeight: '90vh',
            autoFocus: false,
            injector: this.injector,
            data: { mode: 'album' },
        });
    }

    goHome() {
        this.router.navigate(['/']);
        this.albumStore.setActiveFolder(null);
    }

    async downloadPages() {
        this.isDownloadingPages.set(true);
        await this.albumStore.downloadAlbumPages(
            this.albumStore.activeAlbum()!.name,
        );
        this.isDownloadingPages.set(false);
    }

    ngOnDestroy(): void {
        this.albumStore.clearAlbum();
        this.albumStore.clearPageDivElements();
    }
}
