import { Request, Response , NextFunction} from "express";
export interface RequestInterface extends Request {
    rawBody?: string;
    routhr?: {
        route?: RouteProps;
        rawbody?: string;
        data?: any;
    }
}
export interface ResponseInterface extends Response {
}
export interface NextFunctionInterface extends NextFunction {
}

export interface RouthrInterface {
    routes: RouteInterface[];
    route: RouteProps;
    readonly request: RequestInterface;
    app: Express.Application;
    port: number;
    init: () => void;
    useRoutes: (routes: RouteInterface[]) => void;
    use: (callback: (req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) => void) => void;
    set(path: string, callback: (req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) => void): void;
    /**
     * @deprecated use start instead
     */
    listen: (callback?: () => void) => void; // deprecated
    start: (callback?: () => void) => void;
}
type MiddlewareInterface = (req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) => void;


interface BuiltinMiddlewareInterface {
    bodyParser: {
        json: MiddlewareInterface;
    }
}


export interface RouthrMiddleWareInterface { 
    bodyParser: BuiltinMiddlewareInterface['bodyParser'];
}
export interface RouteInterface {
    /**
     *The specified path of the route
    **/
    path: string;
    /**
     *The method of the route
    **/
    method: string;
    /* Handler is a function that takes a request and response object as parameters. */
    /**
     * A Function that handles the request and response object.
     * @param req - Request object
     * @param res - Response object
     * @param next - Next function - optional
     */
    handler: (req: RequestInterface, res: ResponseInterface, next?: NextFunction) => void;
    /**
     * A function that handles the middleware for the given route. It is optional.
     * @param req - Request object
     * @param res - Response object
     * @param next - Next function
    **/
    middleware?: MiddlewareInterface;
    /**
     * An array of middleware functions that handles the middleware for the given route. It is optional.
     * @param req - Request object
     * @param res - Response object
     * @param next - Next function
    **/
    middlewares?: MiddlewareInterface[];
}


export interface RouteProps {
    id: string;
    path: string;
    domain: string;
    subdomain: string | null;
    subdomains: string[];
    queries: {
        [key: string]: string | string[] | undefined | any;
    }
    params: {
        [key: string]: string;
    }
}