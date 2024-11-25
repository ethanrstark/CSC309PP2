import prisma from "@/utils/db";
import { hashPassword } from "@/utils/auth";
import { verification } from "@/middleware/auth";
import applyMiddleware from "@/middleware/avatar";
import Multer from "multer";
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "@/constants";

// Define a type for the incoming request body
interface UserProfileRequestBody {
    username?: string;
    password?: string;
    firstname?: string;
    lastname?: string;
    email: string;
    phone?: string;
    role?: string;
}

// For avatar upload
export const config = {
    api: {
        bodyParser: false,
    },
};

/*
    This API route handles updating a user's profile.

    API URL: /api/User/[username]

    Allowed methods: PUT
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    // Only handle POST requests
    if (req.method !== "PUT") {
        res.setHeader("Allow", ["PUT"]);
        return res.status(400).json({ error: "Method not allowed" });
    }

    let name;
    const storage = Multer.diskStorage({
        destination: function (req: any, file: any, cb: any) {
            cb(null, "uploads/");
        },
        filename: function (req: any, file: any, cb: any) {
            cb(null, file.originalname);
            name = file.originalname;
        },
    });

    // Set up Multer for file upload handling
    const upload = Multer({ storage: storage }).single("avatar");
    await applyMiddleware(req, res, upload as any);

    // TODO: delete this if no longer needed
    /*
    console.log(req.body.test)
    console.log(name)
  */

    try {
        const {
            username,
            password,
            firstname,
            lastname,
            email,
            phone,
            role,
        }: UserProfileRequestBody = req.body;
        const { username: currentUsername } = req.query as { username: string };

        // TODO I think we should first check that the req.user.username === the query username, i.e. the person trying to update the profile is the owner of that profile
        // TODO I also think we either shouldn't let them update their email or check that it is unique (isn't used with another account)

        // Check if username already exists
        if (username) {
            const userExist = await prisma.user.findUnique({
                where: { userName: username },
            });

            if (userExist) {
                return res.status(400).json({ error: "Username already exists" });
            }
        }

        // Validate role if provided
        const roles: string[] = ["USER", "ADMIN"];
        if (role && !roles.includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        // Update user profile
        let userEdit = await prisma.user.update({
            where: {
                userName: currentUsername,
            },
            data: {
                userName: username,
                firstName: firstname,
                lastName: lastname,
                email,
                avatar: name,
                phoneNum: phone,
                role,
            },
            select: {
                userName: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                phoneNum: true,
                role: true,
            },
        });

        // If password is provided, update the password
        if (password) {
            userEdit = await prisma.user.update({
                where: {
                    userName: currentUsername,
                },
                data: {
                    password: await hashPassword(password),
                },
                select: {
                    userName: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    avatar: true,
                    phoneNum: true,
                    role: true,
                },
            });
        }

        res.status(200).json(userEdit);
    } catch (err: any) {
        res.status(500).json({ error: "Profile update unsuccessful" }); // TODO: changed to 500 status code
    }
}

export default verification(handler);
