import { RequestInterface } from "routhr";
import { NextFunctionInterface, ResponseInterface } from ".";
import { Delete, Get, Middleware, Post, Route } from "./decorators";
import { allMiddleware, productsMiddleware, testMiddleware } from "./app.middleware";



@Route('products', {
  middleware: allMiddleware
})
export class AppController {
  prefix: string;
  constructor() {
    this.prefix = '/test';
  }

  @Get()
  getHello(req: RequestInterface, res:ResponseInterface) {
    res.send('Hello from new Routhr app');
  }

  @Get('test', {
    middleware: testMiddleware
  })
  getTest(req: RequestInterface, res:ResponseInterface) {
    res.send('Hello test from new Routhr app');
  }

  @Post('/', {
    middleware: productsMiddleware
  })
  postTest(req: RequestInterface, res:ResponseInterface) {
    res.send('Hello test from new Routhr app');
  }
  test() {
    console.log('test');
  }
}