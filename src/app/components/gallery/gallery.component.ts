import { KeyValuePipe, NgFor } from '@angular/common';
import { Component, computed, Input, input, Signal } from '@angular/core';
import { GroupedDicc, PhotoInPage } from '../../../types';

type PhotosArray = [
  string, {
      [key: string]: PhotoInPage
    }
][]

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [NgFor, KeyValuePipe],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent {

  photos = input<GroupedDicc | undefined>();
  url = input('')
  photosArray = computed<PhotosArray | undefined>(() => (this.photos() ? Object.entries(this.photos()!) : undefined))

  getImgSrc({fileName, folder, format}: {fileName: string, folder: string, format?: string}): string {
    return `${this.url()}/${folder}/${fileName}.${format || 'png'}`;
  }

  getPages(pages: number[]): string {
    return pages.join(',')
  }

  test(val: any) {

  }
}
