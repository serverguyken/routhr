/// <reference types="qs" />
import express from 'express';
import { RouteInterface, RequestInterface, ResponseInterface, NextFunctionInterface } from './interface';
/**
 * Create a Routhr application.
 * @param port - Port to listen on
 */
export default class Routhr {
    readonly port: number;
    readonly app: express.Application;
    readonly request: express.Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    private routes;
    private route;
    /**
     * Set to true to suppress any error that occurs within the application.
     */
    silent: boolean;
    /**
     * Set to true to suppress any messages logged to the console.
     **/
    nolog: boolean;
    private message;
    constructor(port: number);
    /**
     * Accepts an array of routes and registers them with the application.
     * @param routes: RouteInterface[]
     * @returns routhr instance
     */
    useRoutes(routes: RouteInterface[]): this;
    /**
     * Middleware that sets the route properties.
    **/
    private setRoutePropsMiddleware;
    /**
     * Get the current route.
    **/
    private getCurrentRoute;
    /**
     * Set the current route.
     **/
    private setCurrentRoute;
    private setRoute;
    /**
     * Registers middleware with the application.
     * @param callback: (req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) => void
     * @returns routhr instance
     * @example
     * routhr.use((req, res) => {
     *    res.send('Hello World');
     * });
     */
    use(callback: <T>(req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) => T): this;
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
    set(path: string, callback: (req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) => void): this;
    init(): void;
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
    listen(callback?: () => void): this;
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
    start(callback?: () => void): this;
}
export { RequestInterface, ResponseInterface, NextFunctionInterface, RouteInterface };
