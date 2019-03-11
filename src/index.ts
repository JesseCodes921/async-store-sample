import * as express from 'express';
import { Request, Response } from 'express';

import * as service from './service';
import * as store from './core/asyncStore';
import { requestContext, otherMiddleware } from './middlewares';

const app = express();
const port = 3000;

app.use(store.initializeMiddleware());
app.use(requestContext());

app.get('/', otherMiddleware, async (req: Request, res: Response) => {
  await service.doSomething();

  res.send('Response to request: ' + store.get('x-id'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`); // tslint:disable-line
});
