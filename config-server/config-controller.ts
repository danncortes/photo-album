import * as fs from 'fs/promises';
import * as path from 'path';
import { Request, Response } from 'express';
import {
    Album,
    AlbumPreview,
    AlbumsConfig,
    PhotosDictionary,
} from '../src/types';

const supportedImageExtensions = ['jpg', 'jpeg', 'png', 'gif'];

async function getAlbumsConfigFileData(): Promise<AlbumsConfig> {
    const albumsConfigFileData: string = await fs.readFile(
        path.resolve(__dirname, './albums-config.json'),
        'utf-8',
    );

    return JSON.parse(albumsConfigFileData);
}

export const configPath = path.resolve(__dirname, './albums-config.json');

async function loadAlbumConfigData(): Promise<AlbumsConfig> {
    const filePath = path.resolve(__dirname, './albums-config.json');
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data) as AlbumsConfig;
    } catch (error) {
        console.error(`Error reading or parsing file ${filePath}:`, error);
        throw error;
    }
}

export async function getAlbums(req: Request, res: Response) {
    try {
        const albumsConfig: AlbumsConfig = await loadAlbumConfigData();
        const albumsPreview: AlbumPreview[] = [];

        for (const key in albumsConfig) {
            const album = albumsConfig[key];
            const {
                id,
                name,
                isGrouped: grouped,
                settings,
                originFolder,
            } = album;

            albumsPreview.push({
                id,
                name,
                isGrouped: grouped,
                settings,
                originFolder,
            });
        }

        res.status(200).send(albumsPreview);
    } catch (error) {
        console.error(`Error getting Albums ${configPath}:`, error);
        res.status(500).send('Error');
    }
}

export async function getAlbum(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const albumsConfig: AlbumsConfig = await getAlbumsConfigFileData();

        res.status(200).send(albumsConfig[id]);
    } catch (error) {
        console.error(
            `Error getting Album ${req.params['id']} ${configPath}:`,
            error,
        );
        res.status(500).send('Error');
    }
}

async function saveAlbumsConfigDataFile(
    filePath: string,
    config: AlbumsConfig,
): Promise<void> {
    try {
        const data = JSON.stringify(config, null, 2);
        await fs.writeFile(filePath, data, 'utf-8');
        console.log(`Config saved to ${filePath}`);
    } catch (error) {
        console.error(`Error writing to file ${filePath}:`, error);
        throw error;
    }
}

export async function saveAlbum(req: Request, res: Response) {
    const config = req.body.config as Album;
    const { id } = config;

    const albumsConfig: AlbumsConfig = await getAlbumsConfigFileData();

    albumsConfig[id] = config;

    try {
        await saveAlbumsConfigDataFile(configPath, albumsConfig);
        res.status(200).send();
    } catch (error) {
        console.error(`Error saving album:`, error);
        res.status(500).send('Error');
    }
}

async function updatePhotosDictionary(
    photosDictionary: PhotosDictionary,
    photoFilesFromFolder: string[],
): Promise<PhotosDictionary> {
    try {
        const newPhotosDictionary: PhotosDictionary = { ...photosDictionary };
        // Filter only supported image files
        const supportedFilesFromFolder = photoFilesFromFolder.filter(
            (fileName) => {
                const extention = fileName.split('.').pop();
                if (extention) {
                    return supportedImageExtensions.includes(extention);
                }
                return false;
            },
        );

        const photoFilesListFromAlbum = Object.keys(photosDictionary);

        const newPhotos = supportedFilesFromFolder.filter(
            (fileName) => !photoFilesListFromAlbum.includes(fileName),
        );

        const removedPhotos = photoFilesListFromAlbum.filter(
            (photo) => !supportedFilesFromFolder.includes(photo),
        );

        for (const photo of removedPhotos) {
            if (photosDictionary[photo].pages.length === 0) {
                delete newPhotosDictionary[photo];
            }
        }

        for (const photo of newPhotos) {
            newPhotosDictionary[photo] = { pages: [] };
        }

        return newPhotosDictionary;
    } catch (error) {
        throw `Error updating photos dictionary: ${error}`;
    }
}

export async function checkAlbum(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
        const albumsConfig: AlbumsConfig = await loadAlbumConfigData();
        const album = albumsConfig[id];
        const newAlbum = { ...album };

        if (album.isGrouped) {
            for (const folder in album.photosDictionary) {
                const path = `${album.originFolder}/${folder}`;
                const photoFilesFromFolder = await fs.readdir(path);
                const photosDictionary: PhotosDictionary =
                    album.photosDictionary[folder];
                const newDictionary = await updatePhotosDictionary(
                    photosDictionary,
                    photoFilesFromFolder,
                );

                newAlbum.photosDictionary[folder] = newDictionary;
            }
        } else {
            const path = `${album.originFolder}`;
            const photoFilesFromFolder = await fs.readdir(path);
            const photosDictionary: PhotosDictionary = album.photosDictionary;
            const newDictionary = await updatePhotosDictionary(
                photosDictionary,
                photoFilesFromFolder,
            );

            newAlbum.photosDictionary = newDictionary;
        }

        albumsConfig[id] = newAlbum;

        await saveAlbumsConfigDataFile(configPath, albumsConfig);
        res.status(200).send();
    } catch (error) {
        throw `Error checking album ${id}: ${error}`;
    }
}
