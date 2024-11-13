import { Component, input, Input } from '@angular/core';
import { GalleryComponent } from "../gallery/gallery.component";
import { PagesComponent } from '../pages/pages.component';
import { Album } from '../../../types';

@Component({
  selector: 'app-album',
  standalone: true,
  imports: [GalleryComponent, PagesComponent],
  templateUrl: './album.component.html',
  styleUrl: './album.component.scss'
})
export class AlbumComponent {

  album = input<Album>();
  
  constructor() {
  }

}
