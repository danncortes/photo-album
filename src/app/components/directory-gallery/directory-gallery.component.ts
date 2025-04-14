import { Component, computed, inject, input, signal } from '@angular/core';
import { Directory, FileDir, FolderDir } from '../../../types';
import { ThumbnailComponent } from '../thumbnail/thumbnail.component';
import { AlbumStore } from '../../store/albums.store';

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
    readonly albumStore = inject(AlbumStore);
    directory = input.required<Directory>();
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
}
