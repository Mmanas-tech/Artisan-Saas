import app from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`Artisan API running on http://${config.host}:${config.port}`);
});
