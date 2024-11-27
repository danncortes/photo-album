import { Component, input } from '@angular/core';
import { PageComponent } from '../page/page.component';
import { Pages } from '../../../types';

@Component({
    selector: 'app-pages',
    standalone: true,
    imports: [PageComponent],
    templateUrl: './pages.component.html',
    styleUrl: './pages.component.scss',
})
export class PagesComponent {
    pages = input.required<Pages>();
}
