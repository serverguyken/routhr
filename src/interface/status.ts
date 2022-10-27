export interface IResponseStatus {
    code: number;
    indication: 'success' | 'failed';
    message: string;
}

export interface IResponseResult<T> {
    status: IResponseStatus;
    data: T;
}