/*
 * Created on Mon Jun 26 2023
 *
 * Copyright (c) 2023 ServerGuyKen - Kehinde Akinsanya
 */

import 'reflect-metadata';
import { ROUTE_MIDDLEWARE_METADATA, ROUTE_PREFIX_METADATA } from '../constants';
import { MiddlewareInterface } from '../interface';

export interface RouteMetadata {
    prefix?: string;
    options?: {
        middleware?: MiddlewareInterface | MiddlewareInterface[];
    }
}

const defaultROuteMetadata: RouteMetadata = {
    prefix: '/',
    options: {
        middleware: []
    }
};
/**
 * Route Class Decorator - Defines the route prefix for the controller class
 * @param prefix - Route prefix
 * @param options - Route options
 */


export function Route(): ClassDecorator
export function Route(prefix: string, options?: {
    middleware?: MiddlewareInterface | MiddlewareInterface[];
}): ClassDecorator
export function Route(prefix?: string, options?: {
    middleware?: MiddlewareInterface | MiddlewareInterface[];
}): ClassDecorator
export function Route(prefix?: string, options?: {
    middleware?: MiddlewareInterface | MiddlewareInterface[];
}): ClassDecorator {
    return (target: object) => {
        Reflect.defineMetadata(ROUTE_PREFIX_METADATA, prefix || '/', target);
        if (options?.middleware) {
            if (Array.isArray(options.middleware)) {
                Reflect.defineMetadata(ROUTE_MIDDLEWARE_METADATA, options.middleware, target);
            } else {
                Reflect.defineMetadata(ROUTE_MIDDLEWARE_METADATA, [options.middleware], target);
            }
        } else {
            Reflect.defineMetadata(ROUTE_MIDDLEWARE_METADATA, [], target);
        }
    };
}
