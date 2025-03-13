import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Dialog, DialogRef } from '@angular/cdk/dialog';

import { Album } from '../../../types';
import { CreateAlbumFormComponent } from '../create-album-form/create-album-form.component';
import { AlbumStore } from '../../store/albums.store';

@Component({
    selector: 'app-home',
    imports: [],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
    dialog = inject(Dialog);
    readonly store = inject(AlbumStore);

    constructor(private router: Router) {}

    ngOnInit(): void {
        this.store.getAlbumsPreview();
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
}
