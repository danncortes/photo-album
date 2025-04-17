import { Component, computed, inject, input, signal } from '@angular/core';
import { Directory, FileDir, FolderDir, Page } from '../../../types';
import { ThumbnailComponent } from '../thumbnail/thumbnail.component';
import { AlbumStore } from '../../store/albums.store';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { AddPagePhotosComponent } from '../add-page-photos/add-page-photos.component';

type activeDirectory = {
    name: string;
    index: number;
};

@Component({
    selector: 'app-directory-gallery',
    imports: [ThumbnailComponent],
    templateUrl: './directory-gallery.component.html',
    styleUrl: './directory-gallery.component.css',
    host: {
        class: ' w-screen',
    },
})
export class DirectoryGalleryComponent {
    dialog = inject(Dialog);
    readonly albumStore = inject(AlbumStore);
    directory = input.required<Directory>();
    isPhotoSelectionEnabled = signal<boolean>(false);
    activeDirectoryPath = signal<activeDirectory[]>([
        {
            name: 'Home',
            index: 0,
        },
    ]);
    activeDirectory = computed<Directory>(() => {
        const sub: Directory = this.directory();
        let directory: Directory = [
            {
                type: 'folder',
                sub,
                name: '',
                path: '',
            },
        ];

        for (let directoryPath of this.activeDirectoryPath()) {
            directory = (directory[directoryPath.index] as FolderDir).sub;
        }

        return directory;
    });

    thereAreSelectedPhotos = computed(() => {
        return this.albumStore.selectedPhotos().size > 0;
    });

    getInDirectory(dir: FolderDir, index: number) {
        if (dir.type === 'folder') {
            this.activeDirectoryPath.update((activeDirectoryPath) => {
                return [...activeDirectoryPath, { name: dir.name, index }];
            });
        }
    }

    setDirectoryActive(index: number) {
        this.activeDirectoryPath.update((activeDirectoryPath) => {
            return activeDirectoryPath.slice(0, index + 1);
        });
    }

    toggleSelection() {
        this.isPhotoSelectionEnabled.update((isPhotoSelectionEnabled) => {
            if (isPhotoSelectionEnabled) {
                this.albumStore.clearSelectedPhotos();
            }
            return !isPhotoSelectionEnabled;
        });
    }

    togglePhotoSelection(photo: FileDir) {
        if (this.isPhotoSelectionEnabled()) {
            this.albumStore.togglePhotoSelection(photo);
        }
    }

    isThumbnailSelected(photo: FileDir) {
        return this.albumStore.selectedPhotos().has(photo);
    }

    openAddPagePhotosDialog() {
        const dialogRef: DialogRef<Page, AddPagePhotosComponent> =
            this.dialog.open(AddPagePhotosComponent, {
                minWidth: '600px',
                data: {
                    albumId: this.albumStore.activeAlbum()?.id,
                    photos: this.albumStore.selectedPhotos(),
                },
            });

        dialogRef.closed.subscribe((page: Page | undefined) => {
            if (page) {
                this.albumStore.addPageWithPhotos(page);
                this.albumStore.clearSelectedPhotos();
            }
        });
    }
}
