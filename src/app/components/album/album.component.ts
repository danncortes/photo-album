import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { GalleryComponent } from '../gallery/gallery.component';
import { PagesComponent } from '../pages/pages.component';
import { TemplatesComponent } from '../templates/templates.component';
import { AlbumStore } from '../../store/albums.store';
@Component({
    selector: 'app-album',
    imports: [GalleryComponent, PagesComponent],
    templateUrl: './album.component.html',
    styleUrl: './album.component.css',
})
export class AlbumComponent implements OnInit, OnDestroy {
    dialog = inject(Dialog);
    readonly albumStore = inject(AlbumStore);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit() {
        this.route.params.subscribe(async (params) => {
            await this.albumStore.checkAndGetAlbum(params['id']);
        });
    }

    openAddPageDialog() {
        const dialogRef: DialogRef<string, TemplatesComponent> =
            this.dialog.open(TemplatesComponent, {
                minWidth: '600px',
                data: this.albumStore.templates(),
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

    downloadPages() {
        this.albumStore.downloadAlbumPages(this.albumStore.activeAlbum()!.name);
    }

    ngOnDestroy(): void {
        this.albumStore.clearAlbum();
        this.albumStore.clearPageDivElements();
    }
}
