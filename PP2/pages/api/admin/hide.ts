import prisma from "@/utils/db";
import { verificationAdmin } from "@/middleware/auth";
import { NextApiRequest, NextApiResponse } from "next";

// API endpoint for hiding content
// Since in admin directory this endpoint should only be reachable by a user with ADMIN role

// Type for the request body
interface RequestBody {
    postId?: number;
    commentId?: number;
    reason?: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "PUT") {
        res.setHeader("Allow", ["PUT"]);
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { postId, commentId, reason }: RequestBody = req.body;

    console.log(postId); // TODO why do you print this?

    if (!postId && !commentId) {
        return res.status(400).json({ message: "postId or commentId required" });
    }

    if (!reason || reason === "") {
        return res.status(400).json({ message: "reason required" });
    }

    try {
        if (postId) {
            // If looking to hide a post
            const post = await prisma.blogPost.update({
                where: { id: postId },
                data: {
                    isHidden: true,
                    hiddenReason: reason,
                },
            });

            // Return post to verify that it was hidden
            return res.status(200).json(post);
        } else if (commentId) {
            // If looking to hide a comment
            const comment = await prisma.comment.update({
                where: { id: commentId },
                data: {
                    isHidden: true,
                    hiddenReason: reason,
                },
            });

            // Return comment to verify that it was hidden
            return res.status(200).json(comment);
        }
    } catch (error: any) {
        return res.status(400).json({ message: "blogpost/comment does not exist" }); // TODO I think this should be a 500 error because a 400 error means that the client made a bad request
        // TODO if there is any reason for a 400 error it should be handled before this and returned
    }
}

export default verificationAdmin(handler);
