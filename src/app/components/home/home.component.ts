import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ConfigService } from '../../services/config.service';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Album } from '../../../types';
import { CreateAlbumFormComponent } from '../create-album-form/create-album-form.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
    dialog = inject(Dialog);

    constructor(
        public configService: ConfigService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.configService.getAlbums();
    }

    openAlbum(id: string) {
        this.router.navigate(['/album', id]);
    }

    openNewAlbumDialog() {
        const dialogRef: DialogRef<Album, CreateAlbumFormComponent> =
            this.dialog.open(CreateAlbumFormComponent, {
                minWidth: '600px',
            });

        dialogRef.closed.subscribe((album: Album | undefined) => {
            if (album) {
                this.createAlbum(album);
            }
        });
    }

    createAlbum(album: Album) {}
}
