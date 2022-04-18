import Routhr, { RouteInterface } from './';
const port: any = process.env.PORT || 3003;
const routhr = new Routhr(port);
const routes: RouteInterface[]  = [
    {
        path: '/hello',
        method: 'GET',
        handler: (req: any, res: any) => {
            res.status(200).json({
                message: 'Hello World'
            });
            console.log(req.routhr.route)
        }
    }
];
routhr.useRoutes(routes);
routhr.listen();