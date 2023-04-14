import express, { RequestHandler, } from 'express';
import { RouthrInterface, RouteInterface, RequestInterface, ResponseInterface, NextFunctionInterface, RouteProps, RouthrMiddleWareInterface, HandlerInterface, MiddlewareInterface } from './interface';
import Message from './message';
import { generateId } from './utils';
import borderParser from 'body-parser';

/* Routhr */
/**
 * Create a Routhr application.
 * @param port - Port to listen on
 */
export default class Routhr {
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
    json: {
        (options?: borderParser.OptionsJson): RequestHandler;
    }
    urlencoded: {
        (options?: borderParser.OptionsUrlencoded): RequestHandler;
    }
    constructor() {
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
        this.message = new Message(this.nolog, this.silent);
        this.route = {
            id: '',
            path: '',
            domain: '',
            subdomain: '',
            subdomains: [],
            queries: {},
            params: {},
        };
        this.json = borderParser.json;
        this.urlencoded = borderParser.urlencoded;
    }
    /* Method useRoutes */
    /**
     * Accepts an array of routes and registers them with the application.
     * @param routes: RouteInterface[]
     * @returns routhr instance
     */
    private setRouthr() {

    }
    /**
     * Registers routes with the application.
     * @param routes `RouteInterface[]
     * @returns `routhr` instance
     * @example
     * routhr.useRoutes([
     *   {
     *      path: '/',
     *      method: 'GET',
     *      handler: (req, res) => {
     *          res.send('Hello World');
     *      }
     *  }
     * ]);
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
            },
            rawbody: req.rawBody,
            body: req.body,
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
                this.message.error('[ROUTHR] Content-Type must be application/json');
            }
            else {
                let data = '';
                req.on('data', (chunk) => {
                    data += chunk;
                });
                req.on('end', () => {
                    req.routhr = {
                        ...req.routhr,
                        rawbody: data,
                    }
                    if (data && data.indexOf('{') > -1) {
                        req.body = JSON.parse(data);
                        req.routhr = {
                            ...req.routhr,
                            body: req.body,
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
    /* Method get */
    /**
     * Routes HTTP GET requests to the specified path with the specified handler function.
     * @param path Path to register the route on
     * @param handler Route handler function
     * @returns routhr instance
     * @example
     * routhr.get('/', (req, res) => {
     *   res.send('Hello World');
     * });
        */
    get<Path extends string, Handlers extends HandlerInterface[]>(path: Path, ...handlers: Handlers) {
        if (path === undefined || path === null) {
            this.message.error('[ROUTHR] Missing path parameter.');
        }
        if (handlers === undefined || handlers === null) {
            this.message.error('[ROUTHR] Missing handler parameter.');
        }
        try {
            this.app.get(path, handlers);
        } catch (err) {
            this.message.error(`[ROUTHR] Error registering route: ${err}`);
        }
    }
    /* Method post */
    /**
     * Routes HTTP POST requests to the specified path with the specified handler function.
     * @param path Path to register the route on. Can be a string or a regular expression.
     * @param handler Route handler function
     * @returns routhr instance
     * @example
     * routhr.post('/', (req, res) => {
     *  res.send('Hello World');
     * });
        */
    post<Path extends string | RegExp, Handlers extends HandlerInterface[]>(path: Path, ...handlers: Handlers) {
        if (path === undefined || path === null) {
            this.message.error('[ROUTHR] Missing path parameter.');
        }
        if (handlers === undefined || handlers === null) {
            this.message.error('[ROUTHR] Missing handler parameter.');
        }
        try {
            this.app.post(path, handlers);
        } catch (err) {
            this.message.error(`[ROUTHR] Error registering route: ${err}`);
        }
    }
    /* Method put */
    /**
     * Routes HTTP PUT requests to the specified path with the specified handler function.
     * @param path Path to register the route on. Can be a string or a regular expression.
     * @param handler Route handler function
     * @returns routhr instance
     * @example
     * routhr.put('/', (req, res) => {
     * res.send('Hello World');
     * });
     * */
    put<Path extends string | RegExp, Handlers extends HandlerInterface[]>(path: Path, ...handlers: Handlers) {
        if (path === undefined || path === null) {
            this.message.error('[ROUTHR] Missing path parameter.');
        }
        if (handlers === undefined || handlers === null) {
            this.message.error('[ROUTHR] Missing handler parameter.');
        }
        try {
            this.app.put(path, handlers);
        } catch (err) {
            this.message.error(`[ROUTHR] Error registering route: ${err}`);
        }
    }
    /* Method delete */
    /**
     * Routes HTTP DELETE requests to the specified path with the specified handler function.
     * @param path Path to register the route on. Can be a string or a regular expression.
     * @param handler Route handler function
     * @returns routhr instance
     * @example
     * routhr.delete('/', (req, res) => {
     * res.send('Hello World');
     * });
     * */
    delete<Path extends string | RegExp, Handlers extends HandlerInterface[]>(path: Path, ...handlers: Handlers) {
        if (path === undefined || path === null) {
            this.message.error('[ROUTHR] Missing path parameter.');
        }
        if (handlers === undefined || handlers === null) {
            this.message.error('[ROUTHR] Missing handler parameter.');
        }
        try {
            this.app.delete(path, handlers);
        } catch (err) {
            this.message.error(`[ROUTHR] Error registering route: ${err}`);
        }
    }
    /* Method patch */
    /**
     * Routes HTTP PATCH requests to the specified path with the specified handler function.
     * @param path Path to register the route on. Can be a string or a regular expression.
     * @param handler Route handler function
     * @returns routhr instance
     * @example
     * routhr.patch('/', (req, res) => {
     * res.send('Hello World');
     * });
     * */
    patch<Path extends string | RegExp, Handlers extends HandlerInterface[]>(path: Path, ...handlers: Handlers) {
        if (path === undefined || path === null) {
            this.message.error('[ROUTHR] Missing path parameter.');
        }
        if (handlers === undefined || handlers === null) {
            this.message.error('[ROUTHR] Missing handler parameter.');
        }
        try {
            this.app.patch(path, handlers);
        } catch (err) {
            this.message.error(`[ROUTHR] Error registering route: ${err}`);
        }
    }
    /* Method options */
    /**
     * Routes HTTP OPTIONS requests to the specified path with the specified handler function.
     * @param path Path to register the route on. Can be a string or a regular expression.
     * @param handler Route handler function
     * @returns routhr instance
     * @example
     * routhr.options('/', (req, res) => {
     * res.send('Hello World');
     * });
     * */
    options<Path extends string | RegExp, Handlers extends HandlerInterface[]>(path: Path, ...handlers: Handlers) {
        if (path === undefined || path === null) {
            this.message.error('[ROUTHR] Missing path parameter.');
        }
        if (handlers === undefined || handlers === null) {
            this.message.error('[ROUTHR] Missing handler parameter.');
        }
        try {
            this.app.options(path, handlers);
        } catch (err) {
            this.message.error(`[ROUTHR] Error registering route: ${err}`);
        }
    }
    /* Method head */
    /**
     * Routes HTTP HEAD requests to the specified path with the specified handler function.
     * @param path Path to register the route on. Can be a string or a regular expression.
     * @param handler Route handler function
     * @returns routhr instance
     * @example
     * routhr.head('/', (req, res) => {
     * res.send('Hello World');
     * });
     * */
    head<Path extends string | RegExp, Handlers extends HandlerInterface[]>(path: Path, ...handlers: Handlers) {
        if (path === undefined || path === null) {
            this.message.error('[ROUTHR] Missing path parameter.');
        }
        if (handlers === undefined || handlers === null) {
            this.message.error('[ROUTHR] Missing handler parameter.');
        }
        try {
            this.app.head(path, handlers);
        } catch (err) {
            this.message.error(`[ROUTHR] Error registering route: ${err}`);
        }
    }
    /* Method register */
    /**
     * Registers middleware with the application.
     * @param path Path to register the middleware on
     * @param callback Middleware function or array of middleware functions to register.
     * @returns routhr instance
     * @example
     * routhr.register('/', (req, res) => {
     *    res.send('Hello World');
     * });
     */
    register<Path extends string, Middleware extends MiddlewareInterface | MiddlewareInterface[]>(path: Path, callback: Middleware) {
        if (path === undefined || path === null) {
            this.message.error('[ROUTHR] Missing path parameter.');
        }
        if (callback === undefined || callback === null) {
            this.message.error('[ROUTHR] Missing callback parameter.');
        }
        try {
            this.app.use(path, callback);
        }
        catch (err) {
            this.message.error(`[ROUTHR] Error registering middleware: ${err}`);
        }
        return this;
    }
    /* Method use */
    /**
     * Registers middleware with the application.
     * @param callback (req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) => void
     * @returns routhr instance
     * @example
     * routhr.use((req, res) => {
     *   res.send('Hello World');
     * });
    */
    use(callback: MiddlewareInterface | MiddlewareInterface[]) {
        if (callback === undefined || callback === null) {
            this.message.error('[ROUTHR] Missing callback parameter.');
        }
        try {
            this.app.use(callback);
        }
        catch (err) {
            this.message.error(`[ROUTHR] Error registering middleware: ${err}`);
        }
        return this;
    }
    /* Method set */
    /**
     * Assign settings `name` to `value`.
     * @param name - string
     * @param value - any
     * @returns `routhr` instance
     * @example
     * routhr.set('foo', 'bar');
     * routhr.get('foo'); // => 'bar'
     */
    set(name: string, value: any) {
        if (name === undefined || name === null) {
            this.message.error('[ROUTHR] Missing name parameter.');
        }
        if (value === undefined || value === null) {
            this.message.error('[ROUTHR] Missing value parameter.');
        }
        try {
            this.app.set(name, value);
        }
        catch (err) {
            this.message.error(`[ROUTHR] Error registering middleware: ${err}`);
        }
        return this;
    }
    /* Method engine */
    /**
     * Register the given template engine callback `fn` as `ext`.
     * When a file with the given `ext` is rendered it will invoke
     * the given callback `fn`, for example when you try to render
     * "foo.jade" it will invoke the given callback with "foo.jade"
     * as the filename.
     * @param ext - string
     * @param fn - (path: string, options: any, callback: (err: any, str: string) => void) => void
     * @returns `routhr` instance
     * @example
     * routhr.engine('html', require('ejs').renderFile);
     */
    engine(ext: string, fn: (path: string, options: any, callback: (err: any, rendered: string) => void) => void) {
        if (ext === undefined || ext === null) {
            this.message.error('[ROUTHR] Missing ext parameter.');
        }
        if (fn === undefined || fn === null) {
            this.message.error('[ROUTHR] Missing fn parameter.');
        }
        try {
            this.app.engine(ext, fn);
        }
        catch (err) {
            this.message.error(`[ROUTHR] Error registering middleware: ${err}`);
        }
        return this;
    }
    /* Method render */
    /**
     * Render `view` with the given `options` and optional callback `fn`.
     * When a callback function is given a response will _not_ be made
     * automatically, otherwise a response of _200_ and _text/html_ is given.
     * Options:
     *  - `cache`     boolean hinting to the engine it should cache
     * - `filename`  filename of the view being rendered
     * @param view - string
     * @param options - any
     * @param fn - (err: any, html: string) => void
     * @returns `routhr` instance
     * @example
     * routhr.render('email', {
     *  name: 'Tobi'
     * }, function(err, html){
     * // ...
     * });
     */
    render(view: string, options: any, fn: (err: any, html: string) => void) {
        if (view === undefined || view === null) {
            this.message.error('[ROUTHR] Missing view parameter.');
        }
        if (options === undefined || options === null) {
            this.message.error('[ROUTHR] Missing options parameter.');
        }
        if (fn === undefined || fn === null) {
            this.message.error('[ROUTHR] Missing fn parameter.');
        }
        try {
            this.app.render(view, options, fn);
        }
        catch (err) {
            this.message.error(`[ROUTHR] Error registering middleware: ${err}`);
        }
        return this;
    }
    private checkMiddleware(route: RouteInterface, type_: string) {
        if (route.middleware && route.middlewares) {
            this.message.error(`[ROUTHR] Route ${route.path} has both ${type_} and ${type_}s.`);
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
    listen(port: number, callback?: () => void) {
        if (this.routes.length === 0) {
            this.message.error('[ROUTHR] No routes have been registered.');
        }
        this.app.listen(port, callback);
        return this;
    }
    /* Method start */
    /**
     * Start the server.
     * @param callback: any
     * @returns routhr instance
     * @example
     * routhr.start(() => {
     *  console.log('Server is running on port 3000');
     * });
     **/
    start(port: number, callback?: () => void) {
        this.app.listen(port, callback);
        return this;
    }
    /**
     * Static method to create a new routhr instance.
     * @param path 
     * @param handler 
     */
    static new() {
        return new Routhr();
    }
    static(root: string, serverStaticOptions?: any) {
        express.static(root, serverStaticOptions);
    }
}


import { IResponseStatus, IResponseResult } from "./interface";

/**
 * Returns a status object with the code, indication and message
 * @param code  The response code
 * @param errInt  The error code - 0: success, 1: failure
 * @param message  The message to return
 * @returns Object
 */
const CreateStatus = (code: number, errInt: number, message: string) => {
    const indication = errInt === 0 ? 'success' : 'failure';
    const status: IResponseStatus = {
        code,
        indication,
        message
    }
    return status;
}
/**
 * Returns a response object with the status and the data
 * @param status The status to return
 * @param data  The data to return
 * @returns Object
 */
const CreateResponse = <IResponseData>(status: IResponseStatus, data: IResponseData): IResponseResult<IResponseStatus, IResponseData> => {
    return {
        status,
        data
    }
}



export { RequestInterface, ResponseInterface, NextFunctionInterface, RouteInterface, express, CreateResponse, CreateStatus };
