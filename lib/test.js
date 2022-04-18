"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("./"));
const port = process.env.PORT || 3003;
const routhr = new _1.default(port);
const routes = [
    {
        path: '/hello',
        method: 'GET',
        handler: (req, res) => {
            res.status(200).json({
                message: 'Hello World'
            });
            console.log(req.routhr.route);
        }
    }
];
routhr.useRoutes(routes);
routhr.listen();
