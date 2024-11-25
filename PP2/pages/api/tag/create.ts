import { NextApiResponse } from "next";
import prisma from "@/utils/db";
import { verification } from "@/middleware/auth";
import { AuthenticatedRequest } from "@/constants";

// Define the structure of the request body
interface CreateTagRequestBody {
    name: string;
}

/*
    This API route handles requests to create a new tag.

    API URL: /api/tag/create

    Allowed methods: POST
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { name } = req.body as CreateTagRequestBody;

    // Validate the input
    if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Tag name is required and must be a string" });
    }

    try {
        // Check if the tag already exists
        const existingTag = await prisma.tag.findUnique({
            where: { name },
        });

        if (existingTag) {
            return res.status(400).json({ error: "Tag already exists" });
        }

        // Create the new tag
        const newTag = await prisma.tag.create({
            data: { name },
        });

        return res.status(201).json(newTag);
    } catch (error: any) {
        return res.status(500).json({ error: "Error occurred while creating the tag" });
    }
}

export default verification(handler);
