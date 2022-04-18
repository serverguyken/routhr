"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const message_1 = __importDefault(require("./message"));
const utils_1 = require("./utils");
/* Routhr */
/**
 * Create a Routhr application.
 * @param port - Port to listen on
 */
class Routhr {
    constructor(port) {
        this.port = port;
        this.app = (0, express_1.default)();
        this.request = express_1.default.request;
        this.routes = [];
        this.silent = false;
        this.nolog = false;
        this.message = new message_1.default();
        this.route = {
            id: '',
            path: '',
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
    useRoutes(routes) {
        this.routes = routes;
        this.init();
        return this;
    }
    /* Built in middleware */
    /* Method setRouteProps */
    /**
     * Middleware that sets the route properties.
    **/
    setRoutePropsMiddleware(req, res, next) {
        this.setCurrentRoute(req);
        req.routhr = {
            route: this.getCurrentRoute(),
        };
        next();
    }
    /* Method setRoute */
    /**
     * Get the current route.
    **/
    getCurrentRoute() {
        return this.route;
    }
    /* Method setCurrentRoute */
    /**
     * Set the current route.
     **/
    setCurrentRoute(req) {
        const id = (0, utils_1.generateId)();
        const path = req.path;
        const queries = req.query;
        const params = req.params;
        this.setRoute(id, path, queries, params);
    }
    setRoute(id, path, queries, params) {
        this.route = {
            id,
            path,
            queries,
            params,
        };
        return this.route;
    }
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
    use(callback) {
        if (callback === undefined || callback === null) {
            if (!this.silent) {
                this.message.error('Missing callback parameter.');
            }
        }
        try {
            this.app.use(callback);
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
    set(path, callback) {
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
    init() {
        for (const route of this.routes) {
            if (!this.nolog) {
                this.message.create((`Registering route: ${route.path} Method: ${route.method}`));
            }
            switch (route.method) {
                case 'GET':
                    if (route.middleware) {
                        this.app.get(`${route.path}`, [this.setRoutePropsMiddleware, route.middleware], route.handler);
                    }
                    else {
                        this.app.get(`${route.path}`, [this.setRoutePropsMiddleware], route.handler);
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
                    break;
                case 'PATCH':
                    if (route.middleware) {
                        this.app.patch(`${route.path}`, route.middleware, route.handler);
                    }
                    else {
                        this.app.patch(`${route.path}`, route.handler);
                    }
                    break;
                case 'HEAD':
                    if (route.middleware) {
                        this.app.head(`${route.path}`, route.middleware, route.handler);
                    }
                    else {
                        this.app.head(`${route.path}`, route.handler);
                    }
                    break;
                case 'OPTIONS':
                    if (route.middleware) {
                        this.app.options(`${route.path}`, route.middleware, route.handler);
                    }
                    else {
                        this.app.options(`${route.path}`, route.handler);
                    }
                    break;
                case 'ALL':
                    if (route.middleware) {
                        this.app.all(`${route.path}`, route.middleware, route.handler);
                    }
                    else {
                        this.app.all(`${route.path}`, route.handler);
                    }
                    break;
                default:
                    throw new Error(`Unsupported route method: ${route.method}`);
            }
            setTimeout(() => {
                if (!this.nolog) {
                    this.message.create((`Successfully registered route: ${route.path} Method: ${route.method}`));
                }
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
    listen(callback) {
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
    start(callback) {
        if (this.routes.length === 0) {
            if (!this.silent) {
                throw new Error('No routes have been registered.');
            }
        }
        this.app.listen(this.port, callback);
        return this;
    }
}
exports.default = Routhr;
