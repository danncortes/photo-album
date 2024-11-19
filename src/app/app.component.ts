import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlbumComponent } from './components/album/album.component';
import { TemplatesComponent } from './components/templates/templates.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, AlbumComponent, TemplatesComponent],
    providers: [],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    title = 'photo-album';

    constructor() {}
}
