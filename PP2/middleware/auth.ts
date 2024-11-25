import { verifyAccessToken } from "@/utils/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { AuthenticatedRequest, UserPayload } from "@/constants";



// Function authenticates that access token is valid
export function verification(
    handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ message: "provide access token" });
            }

            const user = await verifyAccessToken(authHeader); // Returns the user if successful

            if (!user) {
                return res.status(403).json({ error: "Authentication unsuccessful" });
            }

            req.user = user as UserPayload;
            return handler(req, res);
        } catch (err) {
            res.status(401).json({ error: "Authentication unsuccessful" });
        }
    };
}

// Function authenticates that access token is valid and user is admin
export function verificationAdmin(
    handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ message: "provide access token" });
            }

            const user = await verifyAccessToken(authHeader); // Returns the user if successful

            if (!user) {
                return res.status(403).json({ error: "Authentication unsuccessful" });
            }

            req.user = user as UserPayload;
            if (req.user.role !== "ADMIN") {
                return res.status(403).json({ error: "Not an Admin, Authentication unsuccessful" });
            }

            return handler(req, res);
        } catch (err) {
            res.status(401).json({ error: "Authentication unsuccessful" });
        }
    };
}
