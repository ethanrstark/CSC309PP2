import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/db";
import { verification } from "@/middleware/auth";
import { AuthenticatedRequest } from "@/constants";

// Define types for the request body
interface ReportRequestBody {
    postId?: number;
    commentId?: number;
    reason: string;
}

/*
    This API route handles reporting a post or comment by a user. It creates a report in the database with the user's id, the post or comment id, and the reason for reporting.

    API URL: /api/User/report

    Allowed methods: POST
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ message: "Method not allowed" });
    }
    try {
        const { postId, commentId, reason }: ReportRequestBody = req.body;

        const userId = req.user.id;

        // Check if reason is provided
        if (!reason) {
            return res.status(400).json({ error: "reason required" });
        }

        if (postId && !isNaN(postId)) {
            // Handle reporting a post
            const post = await prisma.blogPost.findUnique({
                where: {
                    id: postId,
                },
            });

            // If the post exists, create a report
            if (post) {
                const report = await prisma.report.create({
                    data: {
                        userId,
                        postId,
                        reason,
                    },
                });

                return res.status(200).json({ message: "Post reported successfully" });
            } else {
                return res.status(404).json({ error: "Post not found" });
            }
        } else if (commentId && !isNaN(commentId)) {
            // Handle reporting a comment
            const comment = await prisma.comment.findUnique({
                where: {
                    id: commentId,
                },
            });

            // If the comment exists, create a report
            if (comment) {
                const report = await prisma.report.create({
                    data: {
                        userId: userId,
                        commentId: commentId,
                        reason: reason,
                    },
                });

                return res.status(200).json({ message: "Comment reported successfully" });
            } else {
                return res.status(404).json({ message: "Comment not found" });
            }
        } else {
            return res.status(400).json({ message: "Please provide a post or comment id" });
        }
    } catch (error: any) {
        return res.status(500).json({ message: "Error reporting post/comment" }); // TODO: changed to 500 status code
    }
}

export default verification(handler);
