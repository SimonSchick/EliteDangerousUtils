import * as request from 'request';

export type Response<T> = request.RequestResponse & { body: T };
export type Options = request.OptionsWithUri;

export class HTTPError extends Error {
    constructor (public response: Response<any>) {
        super(`Request failed with status code ${response.statusCode}.`);
    }
}
export class ClientError extends HTTPError {}

export class BadRequest extends ClientError {}
export class Unauthorized extends ClientError {}
export class Forbidden extends ClientError {}
export class NotFound extends ClientError {}
export class TooManyRequests extends ClientError {}

export class ServerError extends HTTPError {}

export class InternalServerError extends ServerError {}

export class HTTPClient {
    public static Jar() {
        return request.jar();
    }
    private generateError (response: Response<any>): HTTPError {
        const { statusCode } = response;
        if (statusCode < 200 || statusCode >= 300) {
            switch(statusCode) {
                case 400:
                    return new BadRequest(response);
                case 401:
                    return new Unauthorized(response);
                case 403:
                    return new Forbidden(response);
                case 404:
                    return new NotFound(response);
                case 429:
                    return new TooManyRequests(response);
                case 500:
                    return new InternalServerError(response);
                default:
                    if (statusCode > 500) {
                        return new ServerError(response);
                    }
                    if (statusCode > 400) {
                        return new ClientError(response);
                    }
            }
        }
        return undefined;
    }
    public request<T>(opts: Options): Promise<Response<T>> {
        return new Promise<Response<T>>((resolve, reject) => {
            request(opts, (error, response: Response<T>) => {
                error = error || this.generateError(response);
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }

}
