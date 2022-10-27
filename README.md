<img src="https://ik.imagekit.io/serverguyken/4CCB3318-632C-4C7B-8612-E4D9F24844D7_S-A3z03OT.jpeg?ik-sdk-version=javascript-1.4.3&updatedAt=1666853721471" width="240" height="200"/>

# Routhr

**Routhr** is a Node.js Framework for building web Applications and APIs.

<img src="https://img.shields.io/npm/v/routhr?style=for-the-badge"/> <img src="https://img.shields.io/npm/dt/routhr?style=for-the-badge"/> <img src="https://img.shields.io/github/checks-status/serverguyken/routhr/main?style=for-the-badge"/> 

## Installation

```bash
npm install routhr
```
## Usage

```ts
import Routhr  from 'routhr';
import routes from './routes';
const routhr = new Routhr();

// Start server
routhr.start(3000); // start server on port 3000

// Routes
routhr.use('/', req, res) => {
  res.send('Hello World')
}
// or call useRoutes method

import { RouteInterface } from 'routhr';
const routes: RouteInterface[] = [
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

routhr.useRoutes(routes); // create routes 
```
