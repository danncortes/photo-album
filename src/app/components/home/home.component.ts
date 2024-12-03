import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ConfigService } from '../../services/config.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
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
}
