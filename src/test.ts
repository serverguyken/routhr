import { ResponseInterface } from "routhr";
import { Get, Route } from "./decorators";
import { RequestInterface } from "./interface";
import Routhr from "./";

@Route('app')
class AppController {
    v: string;
    constructor() {
        this.v = "1.0.0";
    }
    @Get("home")
    home(req: RequestInterface, res: ResponseInterface) {
        res.send("Home page");
    }
}

function init() {
    const app = new Routhr();
    app.useControllers([AppController]);
    app.start(3070);
}

init();