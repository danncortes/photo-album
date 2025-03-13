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
    styleUrl: './album.component.scss',
})
export class AlbumComponent implements OnInit, OnDestroy {
    dialog = inject(Dialog);
    readonly store = inject(AlbumStore);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit() {
        this.route.params.subscribe(async (params) => {
            await this.store.checkAndGetAlbum(params['id']);
        });
    }

    openAddPageDialog() {
        const dialogRef: DialogRef<string, TemplatesComponent> =
            this.dialog.open(TemplatesComponent, {
                minWidth: '600px',
                data: this.store.templates(),
            });

        dialogRef.closed.subscribe((template: string | undefined) => {
            if (template) {
                this.store.addPage(template);
            }
        });
    }

    goHome() {
        this.router.navigate(['/']);
        this.store.setActiveFolder(null);
    }

    downloadPages() {
        this.store.downloadAlbumPages(this.store.activeAlbum()!.name);
    }

    ngOnDestroy(): void {
        this.store.clearAlbum();
        this.store.clearPageDivElements();
    }
}
