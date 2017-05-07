import * as request from 'request';

export type Response<T> = request.RequestResponse & { body: T };
export type Options = request.OptionsWithUri;

export class HTTPClient {
    public static Jar() {
        return request.jar();
    }
    public request<T>(opts: Options): Promise<Response<T>> {
        return new Promise<Response<T>>((resolve, reject) => {
            request(opts, (error, response) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(<Response<T>>response);
            });
        });
    }

}
