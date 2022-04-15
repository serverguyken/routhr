import express from 'express';
import { RouteInterface, RequestInterface, ResponseInterface, NextFunctionInterface } from './interface';
/* Routhr */
/**
 * Create a Routhr application.
 * @param port - Port to listen on
 */
export default class Routhr {
    readonly port: number;
    readonly app: express.Application;
    private routes: RouteInterface[];
    /* Property silent */ 
    /**
     * Set to true to suppress any error that occurs in the application.
     */
    silent: boolean;
    constructor(port: number) {
        this.port = port;
        this.app = express();
        this.routes = [];
        this.silent = false;
    }
    /* Method useRoutes */ 
    /**
     * Accepts an array of routes and registers them with the application.
     * @param routes: RouteInterface[]
     * @returns routhr instance
     */
    useRoutes(routes: RouteInterface[]) {
        this.routes = routes;
        this.init();
        return this;
    }
    /* Method use */
    /**
     * Registers middleware with the application.
     * @param path: string
     * @param callback: any
     * @returns routhr instance
     * @example
     * routhr.use('/', (req, res) => {
     *    res.send('Hello World');
     * });
     */
    use(path: string, callback: (req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface ) => void) {
        try {
            this.app.use(path, callback);
        }
        catch (err) {
            console.log(`Error registering middleware: ${err}`);
        }
    }
    init() {
        for (const route of this.routes) {
            console.log(`Registering route: ${route.path}`, route.method);
            switch (route.method) {
                case 'GET':
                    if (route.middleware) {
                        this.app.get(`${route.path}`, route.middleware, route.handler);
                    }
                    else {
                        this.app.get(`${route.path}`, route.handler);
                    }
                    break;
                case 'POST':
                    if (route.middleware) {
                        this.app.post(`${route.path}`, route.middleware, route.handler);
                    }
                    else {
                        this.app.post(`${route.path}`, route.handler);
                    }
                    break;
                case 'PUT':
                    if (route.middleware) {
                        this.app.put(`${route.path}`, route.middleware, route.handler);
                    }
                    else {
                        this.app.put(`${route.path}`, route.handler);
                    }
                    break;
                case 'DELETE':
                    if (route.middleware) {
                        this.app.delete(`${route.path}`, route.middleware, route.handler);
                    }
                    else {
                        this.app.delete(`${route.path}`, route.handler);
                    }
                default:
                    throw new Error(`Unsupported route method: ${route.method}`);
            }
        }
    }
    /* Method listen */
    /**
     * Starts the server.
     * Note: This method must be called after all routes have been registered.
     * @param callback: any
     * @returns routhr instance
     * @example
     * routhr.listen(() => {
     *   console.log('Server is running on port 3000');
     * });
     **/
    listen(callback?: () => void) {
        if (this.routes.length === 0) {
            if (!this.silent) {
                throw new Error('No routes have been registered.');
            }
        }
        this.app.listen(this.port, callback);
        return this;
    }
}

export { RequestInterface, ResponseInterface, RouteInterface };