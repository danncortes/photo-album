import * as fs from 'fs/promises';
import * as path from 'path';
import { Request, Response } from 'express';
import { configPath } from '.';
import { Album, AlbumPreview, AlbumsConfig } from '../src/types';

async function getAlbumsConfigFileData(): Promise<AlbumsConfig> {
    const albumsConfigFileData: string = await fs.readFile(
        path.resolve(__dirname, './albums-config.json'),
        'utf-8',
    );

    return JSON.parse(albumsConfigFileData);
}

export async function getAlbums(req: Request, res: Response) {
    try {
        const albumsConfig: AlbumsConfig = await getAlbumsConfigFileData();
        const albumsPreview: AlbumPreview[] = [];

        for (const key in albumsConfig) {
            const album = albumsConfig[key];
            const { id, name, type, settings, baseUrl } = album;

            albumsPreview.push({
                id,
                name,
                type,
                settings,
                baseUrl,
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

export async function saveConfig(req: Request, res: Response) {
    const config = req.body.config as Album;
    const { id } = config;

    const albumsConfig: AlbumsConfig = await getAlbumsConfigFileData();

    albumsConfig[id] = config;

    try {
        const data = JSON.stringify(albumsConfig, null, 2);
        await fs.writeFile(configPath, data, 'utf-8');
        res.status(200).send();
    } catch (error) {
        console.error(`Error writing to file ${configPath}:`, error);
        res.status(500).send('Error');
    }
}

export async function getConfig(req: Request, res: Response) {
    try {
        const albumsConfig = await fs.readFile(
            path.resolve(__dirname, './albums-config.json'),
            'utf-8',
        );
        res.status(200).send(albumsConfig);
    } catch (error) {
        console.error(`Error getting Albums config ${configPath}:`, error);
        res.status(500).send('Error');
    }
}
