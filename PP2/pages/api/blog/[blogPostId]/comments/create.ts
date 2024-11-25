import { NextApiResponse } from "next";
import prisma from "@/utils/db";
import { verification } from "@/middleware/auth";
import { AuthenticatedRequest } from "@/constants";

// Type for the handler request body
interface CreateCommentRequestBody {
    content: string;
    parentId?: number | null;
}

/*
    This API route handles requests to create a new comment/reply on the blog post with blogPostId.

    API URL: /api/blog/[blogPostId]/comments/create

    Allowed methods: POST
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const user = req.user;
    const postId = parseInt(req.query.blogPostId as string, 10);
    const { content, parentId }: CreateCommentRequestBody = req.body;

    // Validate the user input
    if (!content || typeof content !== "string" || content.trim() === "") {
        return res.status(400).json({ error: "Comment must be a non-empty string" });
    }

    // Handle the parentId
    const processedParentId = parentId === undefined || parentId === null ? null : parentId;
    if (processedParentId !== null && typeof processedParentId !== "number") {
        return res.status(400).json({ error: "ParentId must be a number or null" });
    }

    try {
        const newComment = await prisma.comment.create({
            data: {
                content,
                authorId: user.id,
                parentId: processedParentId,
                postId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        userName: true,
                        avatar: true,
                        role: true,
                    },
                },
            },
        });

        return res.status(201).json(newComment);
    } catch (error: any) {
        return res.status(500).json({ error: "Error occurred while creating the comment" });
    }
}

export default verification(handler);
