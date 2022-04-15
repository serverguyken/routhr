# Routhr

**Routhr** is a simple library for creating and managing server routes. It uses express.js as the server framework.

## Installation

```bash
npm install routhr
```
## Usage

```ts
import Routhr  from 'routhr';
import routes from './routes';
const routhr = new Routhr();

// Routes
routhr.useRoutes(routes); // create routes 

// Start server
routhr.listen(3000); // start server on port 3000

// Routes
import { RouteInterface } from 'routhr';
const routes: RouteInterface = [
    {
        path: '/',
        method: 'GET',
        handler: (req, res) => {
            res.send('Hello World');
        },
        middleware: (req, res, next) => {
            console.log('Middleware');
            next();
        }
    }
];
```



