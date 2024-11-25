import { NextApiRequest, NextApiResponse } from "next";
import { hashPassword } from "@/utils/auth";
import prisma from "@/utils/db";

// Define the shape of the request body
interface UserCreateRequestBody {
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
}

/*
    This API route handles user sign up. It creates a new user account by storing the user details in the database and ensuring
    the username and email used are unique.

    API URL: /api/User/SignUp

    Allowed methods: POST
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(400).json({ error: "Method not allowed" });
    }

    try {
        const { userName, password, firstName, lastName, email }: UserCreateRequestBody = req.body;

        // Validate the required fields
        if (!userName || !email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // Check if the username already exists
        const userExist = await prisma.user.findUnique({
            where: {
                userName,
            },
        });

        if (userExist) {
            return res
                .status(400)
                .json({ error: "Username already exists. Please use a different one." });
        }

        // Check if the email already exists
        const emailExist = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (emailExist) {
            return res
                .status(400)
                .json({ error: "Email already exists. Please use a different one or login." });
        }

        // Create the new user account
        const user = await prisma.user.create({
            data: {
                userName,
                email,
                password: await hashPassword(password), // Hash the password before storing
                firstName,
                lastName,
            },
        });

        res.status(200).json({ message: "Account created successfully" });
    } catch (err: any) {
        res.status(500).json({ error: "Unable to create new user account" }); // TODO: changed to 500 status code
    }
}
