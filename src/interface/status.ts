export interface IResponseStatus {
    code: number;
    indication: 'success' | 'failure';
    message: string;
}

export interface IResponseResult<IResponseStatus, IResponseData> {
    status: IResponseStatus;
    data: IResponseData;
}