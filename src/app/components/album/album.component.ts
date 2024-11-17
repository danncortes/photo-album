import { Component, input } from '@angular/core';
import { GalleryComponent } from '../gallery/gallery.component';
import { PagesComponent } from '../pages/pages.component';
import { Album } from '../../../types';
import { ConfigService } from '../../services/config.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-album',
    standalone: true,
    imports: [GalleryComponent, PagesComponent, MatButtonModule],
    templateUrl: './album.component.html',
    styleUrl: './album.component.scss',
})
export class AlbumComponent {
    album = input.required<Album>();
    index = input.required<number>();

    constructor(private configService: ConfigService) {}

    addPage() {
        this.configService.addPage(this.index()!, {
            photos: Array.from({ length: 4 }).map(() => ({
                fileName: '',
                folder: '',
                styles: [],
            })),
            format: 'square',
            template: '4-1',
        });
    }
}
