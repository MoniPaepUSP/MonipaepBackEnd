import app from './app';
import logger from './common/loggerConfig';

app.listen(3333, () => logger.info('Server Running'))
