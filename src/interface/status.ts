export interface IResponseStatus {
    code: number;
    indication: 'success' | 'failure';
    message: string;
}

export interface IResponseResult<T> {
    status: IResponseStatus;
    data: T;
}