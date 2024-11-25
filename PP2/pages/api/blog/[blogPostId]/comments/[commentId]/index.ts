import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/db";

/*
    This API route handles requests to retrieve a comment with commentId.

    API URL: /api/blog/[blogPostId]/comments/[commentId]/

    Allowed methods: GET
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const commentId = parseInt(req.query.commentId as string, 10);

    // Validate commentId
    if (isNaN(commentId)) {
        return res.status(400).json({ error: "Invalid comment ID" });
    }

    try {
        // Retrieve the comment and its associated author details
        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId,
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

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        return res.status(200).json(comment);
    } catch (error: any) {
        return res.status(500).json({ error: "Error occurred while retrieving comment" });
    }
}
