/*
 * Created on Mon Jun 26 2023
 *
 * Copyright (c) 2023 ServerGuyKen - Kehinde Akinsanya
 */

export type TRequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'ALL';


/**
 * Pick a type from a union type
 * @example
 * type T = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "ALL";
 * type K = PickFromUnion<T, "GET">; // K is "GET"
 */
export type TPickFromUnion<T, K extends keyof T> = T extends any ? { [P in K]: T[P] } : never;


/**
 * Controller type
*/
// a controller is a class with a route prefix and a set of methods
export type TController = object

/**
 * Global prefix type
 */
export type TGlobalPrefix = {
    prefix: string;
    exclude?:  Array<{
        path: string;
        method: TRequestMethod;
    }>
}