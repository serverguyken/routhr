import { AppController } from "./app.controller";
import Routhr from ".";
import { RequestMethod } from "./enums";

async function init() {
    const app = new Routhr();
    app.setGlobalPrefix('api/v1', {
        exclude: [
            {
                path: '/test',
                method: RequestMethod.GET
            }
        ]
    });
    app.useControllers([AppController])
    await app.start(3022);
}

init();