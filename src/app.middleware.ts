import { NextFunctionInterface, RequestInterface, ResponseInterface } from "./interface";

const testMiddleware = (req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) => {
    console.log('test middleware');
    next();
  }
  
  const productsMiddleware = (req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) => {
    console.log('products middleware');
    next();
  }
  
  const allMiddleware = (req: RequestInterface, res: ResponseInterface, next: NextFunctionInterface) => {
    console.log('all middleware');
    next();
  }
  

  export { testMiddleware, productsMiddleware, allMiddleware };