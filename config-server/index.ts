import app from './app';

import { APP_PORT, APP_HOST, APP_PROTOCOL } from './config';

app.listen(APP_PORT, () => {
    console.log(
        `Config server started at ${APP_PROTOCOL}${APP_HOST}:${APP_PORT}`,
    );
});
