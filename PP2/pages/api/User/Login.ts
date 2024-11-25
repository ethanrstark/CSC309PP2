import { NextApiRequest, NextApiResponse } from "next";
import { comparePassword, generateBothToken } from "@/utils/auth";
import prisma from "@/utils/db";

// Type for the request body
interface LoginRequestBody {
    username: string;
    password: string;
}

/*
    This API route handles user login. Authenticates the user by verifying their credentials, generating tokens, and storing the refresh token.

    API URL: /api/User/Login

    Allowed methods: POST
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only POST method is allowed
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { username, password }: LoginRequestBody = req.body;

        // Ensure both username and password are provided
        if (!username || !password) {
            return res.status(400).json({ error: "Please provide all required fields" });
        }

        // Find the user by username
        const user = await prisma.user.findUnique({
            where: {
                userName: username,
            },
        });

        // Check if the user exists and if the password matches
        if (!user || !(await comparePassword(password, user.password))) {
            return res.status(401).json({
                error: "Invalid credentials",
            });
        }

        // Generate the tokens (access and refresh)
        const token = generateBothToken({
            ...user,
            role: user.role as "ADMIN" | "USER",
        });

        // Store the refresh token in the database
        await prisma.token.create({
            data: {
                userId: user.id,
                refreshToken: token.refreshToken,
            },
        });

        // Return the tokens in the response
        return res.status(200).json({ token });
    } catch (err: any) {
        return res.status(500).json({ error: "Login unsuccessful" }); // TODO: changed to 500 status code
    }
}
