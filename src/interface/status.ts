export interface IResponseStatus {
    code: number;
    indication: 'success' | 'failure';
    message: string;
    statusCode?: string; // 'OK' | 'ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR';
    timestamp?: string;
    path?: string;
    errors?: Array<{
        field: string;
        message: string;
        line?: number;
        column?: number;
    }>;
}

export interface IResponseResult<IResponseStatus, IResponseData> {
    status: IResponseStatus;
    data: IResponseData;
}