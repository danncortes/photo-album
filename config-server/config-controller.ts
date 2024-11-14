import * as fs from 'fs/promises';
import * as path from 'path';
import { Request, Response } from 'express';
import { configPath } from '.';

export async function saveConfig(req: Request, res: Response) {
    const { config } = req.body;
    console.log('🚀 ~ saveConfig ~ config:', config);

    try {
        const data = JSON.stringify(config, null, 2);
        await fs.writeFile(configPath, data, 'utf-8');
        res.status(200).send('Saved');
    } catch (error) {
        console.error(`Error writing to file ${configPath}:`, error);
        res.status(500).send('Error');
    }
}
