import { Component, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Dialog, DialogRef } from '@angular/cdk/dialog';

import { Album } from '../../../types';
import { CreateAlbumFormComponent } from '../create-album-form/create-album-form.component';
import { AlbumStore } from '../../store/albums.store';
import { PagePreviewComponent } from '../page-preview/page-preview.component';

@Component({
    selector: 'app-home',
    imports: [PagePreviewComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
    dialog = inject(Dialog);
    readonly albumStore = inject(AlbumStore);

    albumSpans = computed(() => {
        return this.albumStore.albumsPreview().map(() => this.getGridSpan());
    });

    constructor(private router: Router) {}

    ngOnInit() {
        this.albumStore.getAlbumsPreview();
    }

    openAlbum(id: string) {
        this.router.navigate(['/album', id]);
    }

    openNewAlbumDialog() {
        const dialogRef: DialogRef<Album, CreateAlbumFormComponent> =
            this.dialog.open(CreateAlbumFormComponent, {
                maxWidth: '600px',
            });
    }

    getGridSpan(): number {
        return Math.round(Math.random() * 1) + 1;
    }
}
