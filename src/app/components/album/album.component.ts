import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { GalleryComponent } from '../gallery/gallery.component';
import { PagesComponent } from '../pages/pages.component';
import { ConfigService } from '../../services/config.service';
import { TemplatesComponent } from '../templates/templates.component';

@Component({
    selector: 'app-album',
    standalone: true,
    imports: [GalleryComponent, PagesComponent],
    templateUrl: './album.component.html',
    styleUrl: './album.component.scss',
})
export class AlbumComponent implements OnInit, OnDestroy {
    dialog = inject(Dialog);

    constructor(
        public configService: ConfigService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit() {
        this.route.params.subscribe((params) => {
            this.configService.checkAndGetAlbum(params['id']);
        });
    }

    openAddPageDialog() {
        const dialogRef: DialogRef<string, TemplatesComponent> =
            this.dialog.open(TemplatesComponent, {
                minWidth: '600px',
                data: this.configService.templates(),
            });

        dialogRef.closed.subscribe((template: string | undefined) => {
            if (template) {
                this.addPage(template);
            }
        });
    }

    addPage(template: string) {
        this.configService.addPage(template);
    }

    goHome() {
        this.router.navigate(['/']);
        this.configService.activeFolder.set(null);
    }

    downloadPages() {
        this.configService.downloadAlbumPages(this.configService.album()!.name);
    }

    ngOnDestroy(): void {
        this.configService.clearAlbum();
    }
}
