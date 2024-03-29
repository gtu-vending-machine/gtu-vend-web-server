import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import api from './api';
import MessageResponse from './interfaces/MessageResponse';
import notFound from './middlewares/notFound';
import errorHandler from './middlewares/errorHandler';

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

app.use('/api/v1', api);

// middleware uses
// next function will execute the next middleware in the stack
app.use(notFound);
app.use(errorHandler);

export default app;
