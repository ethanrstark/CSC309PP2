import { NextApiResponse } from "next";
import prisma from "@/utils/db";
import { verification } from "@/middleware/auth";
import { AuthenticatedRequest } from "@/constants";

// Type for the request body
interface LogoutRequestBody {
    refreshToken: string;
}

/*
    This API route handles logging out a user by deleting their refresh token from the database.
    
    API URL: /api/User/LogOut

    Allowed methods: POST
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    // Only POST method is allowed
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { refreshToken }: LogoutRequestBody = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: "Please provide refresh token" });
        }

        // Delete the refresh token from the database
        await prisma.token.delete({
            where: {
                refreshToken,
            },
        });

        // Return success message on successful logout
        res.status(200).json({ message: "User logged out" });
    } catch (err: any) {
        res.status(500).json({ error: "Logout unsuccessful" }); // TODO: changed to 500 status code (was 401 initially)
    }
}

// Export the handler with authentication verification
export default verification(handler);

// TODO: I left this here in case you wanted to add it back, if not you can remove it
/* const user = await verification(req.headers.authorization)
if(!user){
 return res.status(400).json({error:"Authentication unsuccessful"})
} */
