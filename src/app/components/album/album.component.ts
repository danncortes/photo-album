import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { PagesComponent } from '../pages/pages.component';
import { TemplatesComponent } from '../templates/templates.component';
import { AlbumStore } from '../../store/albums.store';
import { DirectoryGalleryComponent } from '../directory-gallery/directory-gallery.component';
@Component({
    selector: 'app-album',
    imports: [
        PagesComponent,
        DirectoryGalleryComponent,
        DirectoryGalleryComponent,
    ],
    templateUrl: './album.component.html',
    styleUrl: './album.component.css',
    host: {
        class: 'block h-full bg-gray-100',
    },
})
export class AlbumComponent implements OnInit, OnDestroy {
    dialog = inject(Dialog);
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
        const dialogRef: DialogRef<string, TemplatesComponent> =
            this.dialog.open(TemplatesComponent, {
                minWidth: '600px',
                maxHeight: '90vh',
                autoFocus: false,
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
                this.albumStore.addPage(template);
            }
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
