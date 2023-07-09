/*
 * Created on Mon Jun 26 2023
 *
 * Copyright (c) 2023 ServerGuyKen - Kehinde Akinsanya
 */


import 'reflect-metadata';

import { PATH_METADATA, METHOD_METADATA, MIDDLEWARE_METADATA, METHOD_MIDDLEWARE_METADATA } from '../constants';
import { TRequestMethod, TPickFromUnion } from '../types';
import { MiddlewareInterface } from '../interface';

export interface HTTPMetadata {
    path?: string;
    method?: TRequestMethod;
    middleware?: MiddlewareInterface | MiddlewareInterface[];
}

const defaultMetadata: HTTPMetadata = {
    [PATH_METADATA]: '/',
    [METHOD_METADATA]: 'GET',
    [MIDDLEWARE_METADATA]: []
};

export type THTTPMethodReturn = <TPath extends string>(path?: TPath, options?: {
    middleware?: MiddlewareInterface | MiddlewareInterface[];
}) => MethodDecorator

export const HTTP = (metadata: HTTPMetadata): MethodDecorator => {
    const path = metadata[PATH_METADATA] || defaultMetadata[PATH_METADATA];
    const method = metadata[METHOD_METADATA] || defaultMetadata[METHOD_METADATA];
    const middleware = metadata[MIDDLEWARE_METADATA] || defaultMetadata[MIDDLEWARE_METADATA];
    return (target, key, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(PATH_METADATA, path, descriptor.value);
        Reflect.defineMetadata(METHOD_METADATA, method, descriptor.value);
        if (Array.isArray(middleware)) {
            Reflect.defineMetadata(METHOD_MIDDLEWARE_METADATA, middleware, descriptor.value);
        } else {
            Reflect.defineMetadata(METHOD_MIDDLEWARE_METADATA, [middleware], descriptor.value);
        }
        return descriptor;
    };
}

export const mapRequestMethodDecorator = <Path extends string>(method: TRequestMethod) => (path?: Path, options?: {
    middleware?: MiddlewareInterface | MiddlewareInterface[];
}): MethodDecorator => {
    return HTTP({
        [PATH_METADATA]: path,
        [METHOD_METADATA]: method,
        [MIDDLEWARE_METADATA]: options?.middleware
    });
}

/**
 * HTTP GET method decorator - Defines the route for the GET method
 * @param path - Route path
 * @returns MethodDecorator
 */

export const Get = mapRequestMethodDecorator('GET') as THTTPMethodReturn


/**
 * HTTP POST method decorator - Defines the route for the POST method
 * @param path - Route path
 * @returns MethodDecorator
*/

export const Post = mapRequestMethodDecorator('POST') as THTTPMethodReturn;

/**
 * HTTP PUT method decorator - Defines the route for the PUT method
 * @param path - Route path
*/

export const Put = mapRequestMethodDecorator('PUT') as THTTPMethodReturn;


/**
 * HTTP DELETE method decorator - Defines the route for the DELETE method
 * @param path - Route path
 * @returns MethodDecorator
*/

export const Delete = mapRequestMethodDecorator('DELETE') as THTTPMethodReturn;

/**
 * HTTP PATCH method decorator - Defines the route for the PATCH method
 * @param path - Route path
 * @returns MethodDecorator
*/

export const Patch = mapRequestMethodDecorator('PATCH') as THTTPMethodReturn;

/**
 * HTTP OPTIONS method decorator - Defines the route for the OPTIONS method
 * @param path - Route path
 * @returns MethodDecorator
*/

export const Options = mapRequestMethodDecorator('OPTIONS') as THTTPMethodReturn;

/**
 * HTTP HEAD method decorator - Defines the route for the HEAD method
 * @param path - Route path
 * @returns MethodDecorator
*/

export const Head = mapRequestMethodDecorator('HEAD') as THTTPMethodReturn;

/**
 * HTTP ALL method decorator - Defines the route for all the HTTP methods
 * @param path - Route path
 * @returns MethodDecorator
*/

export const All = mapRequestMethodDecorator('ALL') as THTTPMethodReturn;