import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlbumStore } from './store/albums.store';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    providers: [AlbumStore],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    title = 'photo-album';
    albumStore = inject(AlbumStore);

    constructor() {}
}
