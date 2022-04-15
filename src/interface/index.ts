import { Request, Response , NextFunction} from "express";
export interface RequestInterface extends Request {
    
}
export interface ResponseInterface extends Response {
}
export interface NextFunctionInterface extends NextFunction {
}
export interface RouthrInterface {
    routes: RouteInterface[];
    app: Express.Application;
    port: number;
    init: () => void;
    useRoutes: (routes: RouteInterface[]) => void;
    use: (path: string, callback: any) => void;
    listen: (callback?: () => void) => void;
}
export interface RouteInterface {
    path: string;
    method: string;
    /* Handler is a function that takes a request and response object as parameters. */
    /**
     * Handler - a function that handles the request and response object.
     * @param req - Request object
     * @param res - Response object
     * @param next - Next function - optional
     */
    handler: (req: RequestInterface, res: ResponseInterface, next?: NextFunction) => void;
    /**
     * Middleware - a function that handles the middleware for the given route. It is optional.
     * @param req - Request object
     * @param res - Response object
     * @param next - Next function
     **/
    middleware?: (req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) => void;
}
