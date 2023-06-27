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
    private controllers: TController[];
    private globalPrefix: TGlobalPrefix | null;
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
        this.controllers = [];
        this.globalPrefix = null;
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

        // if routes have already been registered, throw an error
        if (this.routes.length > 0) {
            this.message.error('[ROUTHR] You cannot register routes more than once.');
        }
        this.routes = routes;
        this.init();
        return this;
    }

    /**
     * Registers controllers with the application.
     * @param controllers `TController[]`
     * @returns `routhr` instance
     * @example
     * routhr.useControllers([
     *  AppController,
     *  UserController,
     * ]);
     */
    useControllers(controllers: TController[]) {
        if (controllers === undefined || controllers === null) {
            this.message.error('[ROUTHR] Missing controllers parameter.');
        }

        // if routes have been registered, throw an error
        if (this.routes.length > 0) {
            this.message.error('[ROUTHR] You cannot register controllers after routes have been registered.');
        }

        // if controllers have already been registered, throw an error
        if (this.controllers.length > 0) {
            this.message.error('[ROUTHR] You cannot register controllers more than once.');
        }
        this.setControllers(controllers);
        return this;
    }
    /**
     * Set global prefix for all routes.
     * 
     * **Note**: Only supports the `useControllers` method.
     * @param prefix - string
     * @param options - object
     * @returns `routhr` instance
     */
    setGlobalPrefix(prefix: TGlobalPrefix['prefix'], options?: {
        exclude?: TGlobalPrefix['exclude']
    }) {
        if (prefix === undefined || prefix === null) {
            this.message.error('[ROUTHR] Missing prefix parameter.');
        }

        if (options && options.exclude) {
            options.exclude.forEach((exclude) => {
                if (exclude.path === undefined || exclude.path === null) {
                    this.message.error('[ROUTHR] Missing exclude path parameter.');
                }
                if (exclude.method === undefined || exclude.method === null) {
                    this.message.error('[ROUTHR] Missing exclude method parameter.');
                }
            });
            this.globalPrefix = {
                prefix,
                exclude: options.exclude,
            }
        } else {
            this.globalPrefix = {
                prefix,
            }
            return this;
        }
    }
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
    engine(ext: string, fn: (path: string, options: object, callback: (e: any, rendered?: string | undefined) => void) => void) {
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
     * Render the given view `name` name with `options` and a callback `fn` accepting an error and the rendered template string.
     * @param name - string
     * @param options - object
     * @param fn - (err: any, html: string) => void
     * @returns `routhr` instance
     * @example
     * routhr.render('email', { name: 'Tobi' }, function(err, html){
     * // ...
     * });
     */
    render(name: string, options?: object | undefined, fn?: (err: Error, html?: string) => void) {
        if (name === undefined || name === null) {
            this.message.error('[ROUTHR] Missing name parameter.');
        }
        try {
            this.app.render(name, options, fn);
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
        }
    }
    private startsWithSlash(path: string): boolean {
        return path[0] === '/';
    }
    private appendPrefix(path: string, globalPrefix?: string) {
        if (globalPrefix) {
            if (this.startsWithSlash(globalPrefix) && this.startsWithSlash(path)) {
                return `${globalPrefix}${path}`;
            } else if (!this.startsWithSlash(globalPrefix) && !this.startsWithSlash(path)) {
                return `/${globalPrefix}/${path}`;
            } else if (!this.startsWithSlash(globalPrefix) && this.startsWithSlash(path)) {
                return `/${globalPrefix}${path}`;
            } else if (this.startsWithSlash(globalPrefix) && !this.startsWithSlash(path)) {
                return `${globalPrefix}/${path}`;
            } else {
                return `${globalPrefix}${path}`
            }
        } else {
            if (this.startsWithSlash(path)) {
                return path;
            } else {
                return `/${path}`;
            }
        }
    }
    private createPath(route_prefix: string, path: string, method: RequestMethod) {
        const path_append = this.appendPrefix(path || '')
        const get_path = route_prefix + path_append;
        console.log("get_path", get_path);

        const globalPrefix = this.globalPrefix?.exclude && this.globalPrefix?.exclude.find((exclude) => exclude.path === path_append && exclude.method === method) ? '' : this.globalPrefix?.prefix;

        return this.appendPrefix(get_path, globalPrefix);
    }
    private setControllers(controllers: TController[]) {
        const routes: RouteInterface[] = [];
        for (const controller of controllers) {

            // get the controller instance
            const ctr: any = controller;
            const instance = new ctr();

            // get the path of the controller
            const route_prefix = Reflect.getMetadata(ROUTE_PREFIX_METADATA, controller);

            // get all methods of the controller
            const handlers = Object.getOwnPropertyNames(ctr.prototype).filter(method => method !== 'constructor' && typeof ctr.prototype[method] === 'function');
            console.log("handlers", handlers);
            handlers.forEach(handler => {
                // get the method of the controller
                const method = Reflect.getMetadata(METHOD_METADATA, instance[handler]);

                // get the path of the controller
                const path = this.createPath(route_prefix, Reflect.getMetadata(PATH_METADATA, instance[handler]), method);


                // get the middleware of the controller
                const method_middleware = Reflect.getMetadata(METHOD_MIDDLEWARE_METADATA, instance[handler]);
                const middleware = Reflect.getMetadata(MIDDLEWARE_METADATA, instance[handler]);
                const route_middleware = Reflect.getMetadata(ROUTE_MIDDLEWARE_METADATA, controller);

                if (method_middleware && middleware) {
                    if (method_middleware.length > 0 && middleware.length > 0) {
                        this.message.error(`[ROUTHR] Cannot use both ${method} middleware and the @Middleware decorator, use one or the other.`);
                    }
                }

                const middlewareToUse = method_middleware && method_middleware.length > 0 ? method_middleware : middleware && middleware.length > 0 ? middleware : [];
                const new_routes: RouteInterface = {
                    path,
                    method,
                    handler: instance[handler],
                    middlewares: [...route_middleware, ...middlewareToUse]
                }

                // if no method, then the method is just a regular method and not a route, so we  dont need to push it to the routes array and we dont need to do anything else
                if (method) {
                    routes.push(new_routes);
                } else {
                    return;
                }
            });
            break;
        }
        this.routes = routes;
        this.initControllers();
    }
    private initControllers() {
        for (const route of this.routes) {
            switch (route.method) {
                case 'GET':
                    this.app.get(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares!], route.handler);
                    break;
                case 'POST':
                    this.app.post(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares!], route.handler);
                    break;
                case 'PUT':
                    this.app.put(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares!], route.handler);
                    break;
                case 'DELETE':
                    this.app.delete(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares!], route.handler);
                    break;
                case 'PATCH':
                    this.app.patch(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares!], route.handler);
                    break;
                case 'HEAD':
                    this.app.head(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares!], route.handler);
                    break;
                case 'OPTIONS':
                    this.app.options(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares!], route.handler);
                    break;
                case 'ALL':
                    this.app.all(`${route.path}`, [this.setRoutePropsMiddleware, ...route.middlewares!], route.handler);
                    break;
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
import { TRequestMethod, TController, TGlobalPrefix } from './types';
import { METHOD_METADATA, METHOD_MIDDLEWARE_METADATA, MIDDLEWARE_METADATA, PATH_METADATA, ROUTE_MIDDLEWARE_METADATA, ROUTE_PREFIX_METADATA } from './constants';
import { RequestMethod } from './enums';
export const STATUSCODES = {
    200: 'OK',
    201: 'CREATED',
    202: 'ACCEPTED',
    203: 'NON_AUTHORITATIVE_INFORMATION',
    204: 'NO_CONTENT',
    205: 'RESET_CONTENT',
    206: 'PARTIAL_CONTENT',
    207: 'MULTI_STATUS',
    208: 'ALREADY_REPORTED',
    226: 'IM_USED',
    300: 'MULTIPLE_CHOICES',
    301: 'MOVED_PERMANENTLY',
    302: 'FOUND',
    303: 'SEE_OTHER',
    304: 'NOT_MODIFIED',
    305: 'USE_PROXY',
    306: 'RESERVED',
    307: 'TEMPORARY_REDIRECT',
    308: 'PERMANENT_REDIRECT',
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    402: 'PAYMENT_REQUIRED',
    403: 'OPERATION_NOT_ALLOWED',
    404: 'NOT_FOUND',
    405: 'METHOD_NOT_ALLOWED',
    406: 'NOT_ACCEPTABLE',
    407: 'PROXY_AUTHENTICATION_REQUIRED',
    408: 'REQUEST_TIMEOUT',
    409: 'CONFLICT',
    410: 'GONE',
    411: 'LENGTH_REQUIRED',
    412: 'PRECONDITION_FAILED',
    413: 'PAYLOAD_TOO_LARGE',
    414: 'URI_TOO_LONG',
    415: 'UNSUPPORTED_MEDIA_TYPE',
    416: 'RANGE_NOT_SATISFIABLE',
    417: 'EXPECTATION_FAILED',
    418: 'IM_A_TEAPOT',
    421: 'MISDIRECTED_REQUEST',
    422: 'UNPROCESSABLE_ENTITY',
    423: 'LOCKED',
    424: 'FAILED_DEPENDENCY',
    500: 'INTERNAL_SERVER_ERROR',
    501: 'NOT_IMPLEMENTED',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
    504: 'GATEWAY_TIMEOUT',
    505: 'HTTP_VERSION_NOT_SUPPORTED',
    506: 'VARIANT_ALSO_NEGOTIATES',
    507: 'INSUFFICIENT_STORAGE',
    508: 'LOOP_DETECTED',
    509: 'BANDWIDTH_LIMIT_EXCEEDED',
    510: 'NOT_EXTENDED',
    511: 'NETWORK_AUTHENTICATION_REQUIRED'
} as const;

type TStatusCode = keyof typeof STATUSCODES;
/**
 * Creates a response status object
 * @param code  The response code
 * @param errInt  Code to indicate if the response is an error or not. 0 = success, 1 = failure
 * @param message  The status message
 * @param statusCode  The status code e.g. "OK" or "UNAUTHORIZED"
 * @param timestamp  The timestamp of when the response was created
 * @param path  The path of the request
 * @param errors  The errors that occurred
 */
const CreateStatus = (code: TStatusCode | number, errInt: number, message: string, statusCode?: string, timestamp?: string, path?: string, errors?: IResponseStatus['errors']): IResponseStatus => {
    const indication = errInt === 0 ? 'success' : 'failure';

    const GetStatusCode = (code: TStatusCode | number) => {
        if (STATUSCODES[code as TStatusCode]) {
            return STATUSCODES[code as TStatusCode];
        } else {
            return 'UNKNOWN_STATUS_CODE';
        }
    }
    const status: IResponseStatus = {
        code,
        indication,
        message,
        statusCode: statusCode ? statusCode : GetStatusCode(code),
        timestamp: timestamp ? timestamp : new Date().toISOString(),
        path: path ? path : '',
        errors: errors ? errors : []
    }
    return status;
}

/**
 * Creates a response object
 * @param status The status to return
 * @param data  The data to return
 */
const CreateResponse = <IResponseData>(status: IResponseStatus, data: IResponseData): IResponseResult<IResponseStatus, IResponseData> => {
    return {
        status,
        data
    }
}


export { RequestInterface, ResponseInterface, NextFunctionInterface, RouteInterface, express, CreateResponse, CreateStatus };
