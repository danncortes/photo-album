import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlbumStore } from './store/albums.store';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    providers: [AlbumStore],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    title = 'photo-album';

    constructor() {}
}
