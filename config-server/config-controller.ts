import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { Request, Response } from 'express';
import { Album, AlbumPreview, AlbumsConfig, Directory } from '../src/types';

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
            let previewPage = album.pages?.find(
                (page) => page.photos.length > 0,
            );

            if (!previewPage) {
                previewPage = {
                    template: '1-1-1',
                    photos: [],
                };
            }

            const { id, name, settings, originFolder } = album;

            albumsPreview.push({
                id,
                name,
                settings,
                originFolder,
                previewPage,
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
        res.status(400).send('Error');
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

export async function createAlbum(req: Request, res: Response) {
    const album = req.body.data as Album;
    const { name, id, originFolder } = album;

    try {
        if (!name || !id || !originFolder) {
            throw 'Incomplete data';
        }

        try {
            await fs.symlink(
                originFolder,
                path.resolve(__dirname, '../src/assets/albums', id),
                'dir',
            );
        } catch (error) {
            res.status(400).send(error);
            console.error('Error creating the symlink:', error);
            return;
        }

        const albumsConfig: AlbumsConfig = await getAlbumsConfigFileData();

        albumsConfig[id] = album;

        await saveAlbumsConfigDataFile(configPath, albumsConfig);
        res.status(200).send();
    } catch (error) {
        console.error(`Error creating album:`, error);
        res.status(400).send(error);
    }
}

async function buildDirectory(
    path: string,
    pathStart: string,
): Promise<Directory> {
    let directory: Directory = [];
    try {
        const files = await fs.readdir(path, { withFileTypes: true });
        for (const file of files) {
            const fullPath = `${path}/${file.name}`;
            const relativePath = path.split(pathStart).pop() || '';
            if (file.isDirectory()) {
                directory.push({
                    type: 'folder',
                    name: file.name,
                    path: relativePath,
                    sub: await buildDirectory(fullPath, pathStart),
                });
            } else {
                const [, extension] = file.name.split('.');
                if (
                    ['png', 'jpg', 'jpeg', 'gif'].includes(
                        extension?.toLowerCase(),
                    )
                ) {
                    directory.push({
                        type: 'img',
                        name: file.name,
                        path: relativePath,
                    });
                }
            }
        }
        return directory;
    } catch (error) {
        console.error(`Error building directory ${path}:`, error);
        throw `Error building directory ${path}: ${error}`;
    }
}

export function pickFolder(req: Request, res: Response) {
    const command = `osascript -e 'POSIX path of (choose folder with prompt "Select photos directory")'`;

    exec(command, (error: any, stdout: string) => {
        if (error) {
            res.status(400).send({ error: 'No folder selected' });
            return;
        }
        const selectedPath = stdout.trim().replace(/\/$/, '');
        res.status(200).send({ path: selectedPath });
    });
}

export async function getAlbumDirectory(
    req: Request,
    res: Response,
): Promise<any> {
    const { id } = req.params;
    try {
        const albumsConfig: AlbumsConfig = await loadAlbumConfigData();
        const { originFolder } = albumsConfig[id];

        const pathStart = originFolder.split('/').slice(-1)[0];

        let directory: Directory = await buildDirectory(
            originFolder,
            pathStart,
        );

        res.status(200).send(directory);
    } catch (error) {
        res.status(500).send('Error');
    }
}
