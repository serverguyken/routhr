/*
 * Created on Mon Jun 26 2023
 *
 * Copyright (c) 2023 ServerGuyKen - Kehinde Akinsanya
 */

import 'reflect-metadata';

import { MIDDLEWARE_METADATA } from '../constants';
import { MiddlewareInterface } from '../interface';

export type MiddlewareMetadata = MiddlewareInterface | MiddlewareInterface[];

export const Middleware = (metadata: MiddlewareMetadata): MethodDecorator => {
    return (target, key, descriptor: PropertyDescriptor) => {
        if (Array.isArray(metadata)) {
            Reflect.defineMetadata(MIDDLEWARE_METADATA, metadata, descriptor.value);
        } else {
            Reflect.defineMetadata(MIDDLEWARE_METADATA, [metadata], descriptor.value);
        }
    };
}