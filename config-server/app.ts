import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

routes.forEach((route) => {
    app.use(route);
});

export default app;
