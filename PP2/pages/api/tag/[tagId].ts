import { NextApiResponse } from "next";
import prisma from "@/utils/db";
import { verification } from "@/middleware/auth";
import { AuthenticatedRequest } from "@/constants";
import { Prisma } from "@prisma/client";

/*
    This API route handles requests to delete a tag and returns the deleted tag if successful.

    API URL: /api/tag/[tagId]

    Allowed methods: DELETE
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== "DELETE") {
        res.setHeader("Allow", ["DELETE"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const tagId = parseInt(req.query.tagId as string, 10); // Explicitly cast the query parameter as a string
    const user = req.user;

    // Check if tagId is a valid number
    if (isNaN(tagId)) {
        return res.status(400).json({ error: "Invalid tag ID" });
    }

    try {
        // Ensure the user is an admin
        if (user.role !== "ADMIN") {
            return res.status(403).json({ error: "Forbidden, must be an admin to delete tags" });
        }

        const deletedTag = await prisma.tag.delete({
            where: { id: tagId },
        });

        return res.status(200).json(deletedTag);
    } catch (error: unknown) {
        if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025") {
            // The tag was not found
            return res.status(404).json({ error: "Tag not found" });
        } else {
            return res.status(500).json({
                error: "An error occurred while deleting the tag",
            });
        }
    }
}

export default verification(handler);
