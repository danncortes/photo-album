import { Component } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent {
    constructor(
        public configService: ConfigService,
        private router: Router,
    ) {
        this.configService.getAlbums();
    }

    openAlbum(id: string) {
        this.router.navigate(['/album', id]);
    }
}
