import express from 'express';
import {
    saveConfig,
    getConfig,
    getAlbums,
    getAlbum,
} from './config-controller';

const router = express();

router.get(`/albums`, getAlbums);
router.get(`/albums/:id`, getAlbum);
router.post(`/config/save`, saveConfig);
router.get(`/config/get`, getConfig);

export default [router];
