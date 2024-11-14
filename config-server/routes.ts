import express from 'express';
import { saveConfig } from './config-controller';

const router = express();

router.post(`/config/save`, saveConfig);

export default [router];
