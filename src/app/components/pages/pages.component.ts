import { Component, inject } from '@angular/core';

import { PageComponent } from '../page/page.component';
import { AlbumStore } from '../../store/albums.store';

@Component({
    selector: 'app-pages',
    imports: [PageComponent],
    templateUrl: './pages.component.html',
    styleUrl: './pages.component.scss',
})
export class PagesComponent {
    readonly store = inject(AlbumStore);
}
