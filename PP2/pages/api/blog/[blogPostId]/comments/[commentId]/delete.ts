import { NextApiResponse } from "next";
import prisma from "@/utils/db";
import { verification } from "@/middleware/auth";
import { AuthenticatedRequest } from "@/constants";
import { Prisma } from "@prisma/client";

/*
    This API route handles requests to delete a comment with commentId.

    API URL: /api/blog/[blogPostId]/comments/[commentId]/delete

    Allowed methods: DELETE
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== "DELETE") {
        res.setHeader("Allow", ["DELETE"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const commentId = parseInt(req.query.commentId as string, 10);
    const user = req.user;

    if (isNaN(commentId)) {
        return res.status(400).json({ error: "Invalid comment ID" });
    }

    try {
        // Check if the comment exists and verify the user is the author
        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId,
            },
            select: {
                authorId: true,
            },
        });

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (comment.authorId !== user.id) {
            return res.status(403).json({ error: "Forbidden, user is not the comment's author" });
        }

        // Delete the comment
        const deletedComment = await prisma.comment.delete({
            where: {
                id: commentId,
            },
        });

        return res.status(200).json(deletedComment);
    } catch (error: unknown) {
        if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025") {
            // Handle Prisma 'Record not found' error
            return res.status(404).json({ error: "Comment not found" });
        }

        return res.status(500).json({ error: "An error occurred while deleting the comment" });
    }
}

export default verification(handler);
