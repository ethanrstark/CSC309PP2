import prisma from "@/utils/db";
import { verificationAdmin } from "@/middleware/auth";
import { NextApiRequest, NextApiResponse } from "next";

// API endpoint for hiding content
// Since in admin directory this endpoint should only be reachable by a user with ADMIN role

// Type for the request body
interface RequestBody {
    postId?: number;
    commentId?: number;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "PUT") {
        res.setHeader("Allow", ["PUT"]);
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { postId, commentId }: RequestBody = req.body;

    // Unhiding needs no reason set old reason to blank
    const reason: string = "";

    if (!postId && !commentId) {
        return res.status(400).json({ message: "postId or commentId required" });
    }

    try {
        // If looking to unhide a post
        if (postId) {
            const post = await prisma.blogPost.update({
                where: { id: postId },
                data: {
                    isHidden: false,
                    hiddenReason: reason,
                },
            });

            // Return post to verify that the post was hidden
            return res.status(200).json(post);

            // if looking to unhide a comment
        } else if (commentId) {
            const comment = await prisma.comment.update({
                where: { id: commentId },
                data: {
                    isHidden: false,
                    hiddenReason: reason,
                },
            });

            // Return comment to verify that the comment was hidden
            return res.status(200).json(comment);
        }
    } catch (error: any) {
        return res.status(400).json({ message: "blogpost/comment does not exist" }); //TODO same here I think this should be a 500 error
    }
}

export default verificationAdmin(handler);
