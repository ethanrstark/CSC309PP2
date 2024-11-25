import { NextApiResponse } from "next";
import prisma from "@/utils/db";
import { verification } from "@/middleware/auth";
import { AuthenticatedRequest } from "@/constants";

// Define the request body interface
interface EditCommentRequestBody {
    content: string;
}

/*
    This API route handles requests to update a comment with commentId.

    API URL: /api/blog/[blogPostId]/comments/[commentId]/edit

    Allowed methods: PUT
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== "PUT") {
        res.setHeader("Allow", ["PUT"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const commentId = parseInt(req.query.commentId as string, 10);
    const user = req.user;

    // Validate commentId
    if (isNaN(commentId)) {
        return res.status(400).json({ error: "Invalid comment ID" });
    }

    try {
        // Check if the comment exists and verify the user is the author
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { authorId: true },
        });

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (comment.authorId !== user.id) {
            return res.status(403).json({ error: "Forbidden: user is not the comment's author" });
        }

        const { content } = req.body as EditCommentRequestBody;

        // Validate content
        if (!content || typeof content !== "string" || content.trim() === "") {
            return res.status(400).json({ error: "Content must be a non-empty string" });
        }

        // Update the comment
        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: { content },
        });

        return res.status(200).json(updatedComment);
    } catch (error: any) {
        return res.status(500).json({ error: "Error occurred while updating comment" });
    }
}

export default verification(handler);
