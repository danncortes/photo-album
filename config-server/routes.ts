import express from 'express';
import { saveConfig, getConfig } from './config-controller';

const router = express();

router.post(`/config/save`, saveConfig);
router.get(`/config/get`, getConfig);

export default [router];
