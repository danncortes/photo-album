import * as fs from 'fs/promises';
import * as path from 'path';
import { AlbumsConfig } from '../src/types';
import app from './app';

import { APP_PORT, APP_HOST, APP_PROTOCOL } from './config';

app.listen(APP_PORT, () => {
    console.log(
        `Config server started at ${APP_PROTOCOL}${APP_HOST}:${APP_PORT}`,
    );
});

export const configPath = path.resolve(__dirname, './albums-config.json');

async function loadConfig(filePath: string): Promise<AlbumsConfig> {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data) as AlbumsConfig;
    } catch (error) {
        console.error(`Error reading or parsing file ${filePath}:`, error);
        throw error;
    }
}

async function saveConfig(
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

async function checkAndUpdateConfig() {
    const albumUrl =
        '/Users/danncortes/Library/CloudStorage/Dropbox/Photos/Albunes Foto Familia/benni/2023';
    const folders = [
        '09-septiembre',
        '10-octubre',
        '11-noviembre',
        '12-diciembre',
    ];
    const albumsConfig = await loadConfig(configPath);

    let folderPhotos: { [key: string]: string[] } = {};

    for await (const folder of folders) {
        const folderPath = `${albumUrl}/${folder}`;
        let files: string[] = [];

        try {
            files = await fs.readdir(folderPath);
            files = files.map((fileName) => fileName.split('.')[0]);

            folderPhotos = {
                ...folderPhotos,
                [folder]: files,
            };
        } catch (error) {
            console.error(`Error reading folder ${folderPath}:`, error);
        }
    }

    let albumStructureChanged = false;

    for (const folderName in folderPhotos) {
        if (!(folderName in albumsConfig.albums[0].photosDicc)) {
            albumsConfig.albums[0].photosDicc = {
                ...albumsConfig.albums[0].photosDicc,
                [folderName]: {},
            };
            albumStructureChanged = true;
        }

        for (const photoName of folderPhotos[folderName]) {
            if (!(photoName in albumsConfig.albums[0].photosDicc[folderName])) {
                albumsConfig.albums[0].photosDicc[folderName][photoName] = {
                    pages: [],
                };
            }
        }

        if (albumStructureChanged) {
            await saveConfig(configPath, albumsConfig);
        }
    }
}

checkAndUpdateConfig();
