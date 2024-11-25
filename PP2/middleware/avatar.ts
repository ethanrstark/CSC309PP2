import { NextApiRequest, NextApiResponse } from "next";

// Source: https://gist.github.com/agmm/da47a027f3d73870020a5102388dd820

// Type for the middleware function
type Middleware = {
    (req: NextApiRequest, res: NextApiResponse, next: (result?: any) => void): void,
}

const applyMiddleware = (
    req: NextApiRequest,
    res: NextApiResponse,
    middleware: Middleware
): Promise<any> => {
    return new Promise((resolve, reject) => {
        middleware(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result); // Reject with the error if it is an instance of Error
            }

            return resolve(result); // Resolve with the result
        });
    });
};

export default applyMiddleware;
