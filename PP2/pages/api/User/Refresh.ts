import { NextApiRequest, NextApiResponse } from "next";
import { refreshToken } from "@/utils/auth";

/*
    This API route handles the generation of a new access token using a refresh token.

    API URL: /api/User/Refresh

    Allowed methods: POST
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Call the refreshToken utility function to get a new access token
        const newAccess = refreshToken(req.headers.authorization);
        if (!newAccess) {
            return res.status(400).json({ error: "Could not generate new access token" });
        }

        // Return the new access token
        res.status(201).json({ accessToken: newAccess });
    } catch (err: any) {
        res.status(500).json({ error: "Could not generate new access token" }); // TODO: changed to 500 status code
    }
}
