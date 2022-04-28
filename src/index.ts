import express, { RequestHandler } from 'express';
import { RouthrInterface, RouteInterface, RequestInterface, ResponseInterface, NextFunctionInterface, RouteProps, RouthrMiddleWareInterface } from './interface';
import Message from './message';
import { generateId } from './utils';


/* Routhr */
/**
 * Create a Routhr application.
 * @param port - Port to listen on
 */
export default class Routhr {
    readonly port: number;
    readonly app: express.Application;
    readonly request;
    private routes: RouteInterface[];
    private route: RouteProps;
    middleware: RouthrMiddleWareInterface;
    /* Property silent */
    /**
     * Set to true to suppress any error that occurs within the application.
     */
    silent: boolean;
    /* Property nolog */
    /**
     * Set to true to suppress any messages logged to the console.
     **/
    nolog: boolean;
    private message: Message;
    constructor(port: number) {
        this.port = port;
        this.app = express();
        this.request = express.request;
        this.routes = [];
        this.middleware = {
            bodyParser: {
                json: this.JSONParser,
            },
        }
        this.silent = false;
        this.nolog = false;
        this.message = new Message();
        this.route = {
            id: '',
            path: '',
            domain: '',
            subdomain: '',
            subdomains: [],
            queries: {},
            params: {},
        };
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
    /* Built in middleware */
    /* Method setRouteProps */
    /**
     * Middleware that sets the routhr instance on the request object.
    **/
    private setRoutePropsMiddleware(req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) {
        req.routhr = {
            route: {
                id: generateId(),
                path: req.path,
                domain: req.hostname,
                subdomain: req.subdomains[req.subdomains.length - 1] ? req.subdomains[req.subdomains.length - 1] : null,
                subdomains: req.subdomains,
                queries: req.query,
                params: req.params,
            }
        }
        next();
    }
    /* Method setRoute */
    /**
     * Get the current route.
    **/
    private getCurrentRoute() {
        return this.route;
    }
    /* Method setCurrentRoute */
    /**
     * Set the current route.
     **/
    private setCurrentRoute(req: RequestInterface) {
        const id = generateId();
        const path = req.path;
        const queries = req.query;
        const params = req.params;
        this.setRoute(id, path, queries, params);
    }
    private setRoute(id: string, path: string, queries: {}, params: {}, domain: string = '', subdomain: string = '', subdomains: string[] = []) {
        this.route = {
            id,
            path,
            domain,
            subdomain,
            subdomains,
            queries,
            params,
        }
        return this.route;
    }
    private JSONParser(req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) {
        if (req.method === 'POST' || req.method === 'PUT') {
            if (req.headers['content-type'] !== 'application/json') {
                throw new Error('Invalid content-type. Expected application/json');
            }
            else {
                let data = '';
                req.on('data', (chunk) => {
                    data += chunk;
                });
                req.on('end', () => {
                    req.routhr = {
                        route: {
                            id: generateId(),
                            path: req.path,
                            domain: req.hostname,
                            subdomain: req.subdomains[req.subdomains.length - 1] ? req.subdomains[req.subdomains.length - 1] : null,
                            subdomains: req.subdomains,
                            queries: req.query,
                            params: req.params,
                        },
                        rawbody: data,
                    }
                    if (data && data.indexOf('{') > -1) {
                        req.body = JSON.parse(data);
                        req.routhr = {
                            ...req.routhr,
                            data: req.body,
                        }
                    } 
                    next();
                });
            }
        }
        else {
            next();
        }
    };
    /* Method use */
    /**
     * Registers middleware with the application.
     * @param callback: (req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) => void
     * @returns routhr instance
     * @example
     * routhr.use((req, res) => {
     *    res.send('Hello World');
     * });
     */
    use(callback: (req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) => void) {
        if (callback === undefined || callback === null) {
            if (!this.silent) {
                this.message.error('Missing callback parameter.');
            }
        }
        try {
            this.app.use(callback as any);
        }
        catch (err) {
            if (!this.silent) {
                console.log(`Error registering middleware: ${err}`);
            }
        }
        return this;
    }
    /* Method set */
    /**
     * Registers middleware with the application but only for a specific route.
     * @param path: string
     * @param callback - (req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) => void
     * @returns routhr instance
     * @example
     * routhr.set('/', (req, res) => {
     *   res.send('Hello World');
     * });
     */
    set(path: string, callback: (req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) => void) {
        if (path === undefined || path === null) {
            if (!this.silent) {
                this.message.error('Missing path parameter.');
            }
        }
        if (callback === undefined || callback === null) {
            if (!this.silent) {
                this.message.error('Missing callback parameter.');
            }
        }
        try {
            this.app.set(path, callback);
        }
        catch (err) {
            if (!this.silent) {
                console.log(`Error registering middleware: ${err}`);
            }
        }
        return this;
    }
    private checkMiddleware(route: RouteInterface, type_: string) {
        if (route.middleware && route.middlewares) {
            if (!this.silent) {
                this.message.error(`Route ${route.path} has both ${type_} and ${type_}s.`);
            }
        } else {
            return true
        }
    }

    private init() {
        let log = '';
        for (const route of this.routes) {
            switch (route.method) {
                case 'GET':
                    if (this.checkMiddleware(route, 'middleware')) {
                        if (route.middleware) {
                            this.app.get(`${route.path}`, [this.setRoutePropsMiddleware, route.middleware], route.handler);
                        } else if (route.middlewares) {
                            this.checkMiddleware(route, 'middlewares');
                            this.app.get(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares], route.handler);
                        }
                        else {
                            this.app.get(`${route.path}`, [this.setRoutePropsMiddleware], route.handler);
                        }
                    }
                    break;
                case 'POST':
                    if (this.checkMiddleware(route, 'middleware')) {
                        if (route.middleware) {
                            this.app.post(`${route.path}`, [this.setRoutePropsMiddleware, route.middleware], route.handler);
                        } else if (route.middlewares) {
                            this.checkMiddleware(route, 'middlewares');
                            this.app.post(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares], route.handler);
                        }
                        else {
                            this.app.post(`${route.path}`, [this.setRoutePropsMiddleware], route.handler);
                        }
                    }
                    break;
                case 'PUT':
                    if (this.checkMiddleware(route, 'middleware')) {
                        if (route.middleware) {
                            this.app.put(`${route.path}`, [this.setRoutePropsMiddleware, route.middleware], route.handler);
                        } else if (route.middlewares) {
                            this.checkMiddleware(route, 'middlewares');
                            this.app.put(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares], route.handler);
                        }
                        else {
                            this.app.put(`${route.path}`, [this.setRoutePropsMiddleware], route.handler);
                        }
                    }
                    break;
                case 'DELETE':
                    if (this.checkMiddleware(route, 'middleware')) {
                        if (route.middleware) {
                            this.app.delete(`${route.path}`, [this.setRoutePropsMiddleware, route.middleware], route.handler);
                        } else if (route.middlewares) {
                            this.checkMiddleware(route, 'middlewares');
                            this.app.delete(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares], route.handler);
                        }
                        else {
                            this.app.delete(`${route.path}`, [this.setRoutePropsMiddleware], route.handler);
                        }
                    }
                    break;
                case 'PATCH':
                    if (this.checkMiddleware(route, 'middleware')) {
                        if (route.middleware) {
                            this.app.patch(`${route.path}`, [this.setRoutePropsMiddleware, route.middleware], route.handler);
                        } else if (route.middlewares) {
                            this.checkMiddleware(route, 'middlewares');
                            this.app.patch(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares], route.handler);
                        }
                        else {
                            this.app.patch(`${route.path}`, [this.setRoutePropsMiddleware], route.handler);
                        }
                    }
                    break;
                case 'HEAD':
                    if (this.checkMiddleware(route, 'middleware')) {
                        if (route.middleware) {
                            this.app.head(`${route.path}`, [this.setRoutePropsMiddleware, route.middleware], route.handler);
                        } else if (route.middlewares) {
                            this.checkMiddleware(route, 'middlewares');
                            this.app.head(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares], route.handler);
                        }
                        else {
                            this.app.head(`${route.path}`, [this.setRoutePropsMiddleware], route.handler);
                        }
                    }
                    break;
                case 'OPTIONS':
                    if (this.checkMiddleware(route, 'middleware')) {
                        if (route.middleware) {
                            this.app.options(`${route.path}`, [this.setRoutePropsMiddleware, route.middleware], route.handler);
                        } else if (route.middlewares) {
                            this.checkMiddleware(route, 'middlewares');
                            this.app.options(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares], route.handler);
                        }
                        else {
                            this.app.options(`${route.path}`, [this.setRoutePropsMiddleware], route.handler);
                        }
                    }
                    break;
                case 'ALL':
                    if (this.checkMiddleware(route, 'middleware')) {
                        if (route.middleware) {
                            this.app.all(`${route.path}`, [this.setRoutePropsMiddleware, route.middleware], route.handler);
                        } else if (route.middlewares) {
                            this.checkMiddleware(route, 'middlewares');
                            this.app.all(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares], route.handler);
                        }
                        else {
                            this.app.all(`${route.path}`, [this.setRoutePropsMiddleware], route.handler);
                        }
                    }
                    break;
                default:
                    throw new Error(`Unsupported route method: ${route.method}`);
            }
            setTimeout(() => {
            }, 500);
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
     * @deprecated Use start instead.
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
    /* Method start */
    /**
     * Starts the server.
     * Note: This method must be called after all routes have been registered.
     * @param callback: any
     * @returns routhr instance
     * @example
     * routhr.start(() => {
     *  console.log('Server is running on port 3000');
     * });
     **/
    start(callback?: () => void) {
        if (this.routes.length === 0) {
            if (!this.silent) {
                throw new Error('No routes have been registered.');
            }
        }
        this.app.listen(this.port, callback);
        return this;
    }
    /**
     * Static method to create a new routhr instance.
     * @param path 
     * @param handler 
     */
    static new(port:number) {
        return new Routhr(port);
    }
    static(root: string, serverStaticOptions?: any) {
        express.static(root, serverStaticOptions);
    }
}

export { RequestInterface, ResponseInterface, NextFunctionInterface, RouteInterface };
