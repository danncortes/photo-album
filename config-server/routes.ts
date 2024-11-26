import express from 'express';
import {
    saveAlbum,
    getAlbums,
    getAlbum,
    checkAlbums,
} from './config-controller';

const router = express();

router.get(`/albums`, getAlbums);
router.get(`/albums/:id`, getAlbum);
router.post(`/album/save`, saveAlbum);
router.post(`/albums/check`, checkAlbums);

export default [router];
