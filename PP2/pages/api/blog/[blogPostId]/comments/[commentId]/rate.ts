import { NextApiResponse } from "next";
import prisma from "@/utils/db";
import { verification } from "@/middleware/auth";
import { AuthenticatedRequest } from "@/constants";

// Define request body interface for type checking
interface CommentRateRequestBody {
    isUpvote: boolean;
}

/*
    This API route handles requests to create a new comment rating for the user on the 
    comment with commentId if they havent already voted, or updating the user's current 
    vote on the comment with commentId if they have already voted.

    API URL: /api/blog/[blogPostId]/comments/[commentId]/rate

    Allowed methods: POST, PUT
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    // Allow only POST or PUT methods
    if (req.method !== "POST" && req.method !== "PUT") {
        res.setHeader("Allow", ["POST", "PUT"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const commentId = parseInt(req.query.commentId as string, 10);
    const user = req.user;
    const { isUpvote } = req.body as CommentRateRequestBody;

    // Validate input
    if (isNaN(commentId)) {
        return res.status(400).json({ error: "Invalid comment ID" });
    }

    if (typeof isUpvote !== "boolean") {
        return res.status(400).json({ error: "Invalid rating value" });
    }

    if (req.method === "POST") {
        // Handle creating a new rating
        try {
            const existingRating = await prisma.commentRating.findUnique({
                where: { userId_commentId: { userId: user.id, commentId } },
            });

            if (existingRating) {
                return res.status(400).json({ error: "User has already rated this comment" });
            }

            const fieldToIncrement = isUpvote ? "upvoteCount" : "downvoteCount";

            await prisma.$transaction([
                // Create the new rating
                prisma.commentRating.create({
                    data: {
                        isUpvote,
                        commentId,
                        userId: user.id,
                    },
                }),
                // Increment the respective count for that comment
                prisma.comment.update({
                    where: { id: commentId },
                    data: { [fieldToIncrement]: { increment: 1 } },
                }),
            ]);

            return res.status(200).json({ message: "Rating created successfully" });
        } catch (error: any) {
            return res.status(500).json({ error: "Failed to create rating" });
        }
    } else {
        // Handle updating an existing rating
        try {
            const existingRating = await prisma.commentRating.findUnique({
                where: { userId_commentId: { userId: user.id, commentId } },
            });

            if (!existingRating) {
                return res
                    .status(400)
                    .json({ error: "User has not previously rated this comment" });
            }

            if (existingRating.isUpvote === isUpvote) {
                return res
                    .status(400)
                    .json({ error: "User has already rated this comment with the same value" });
            }

            const incrementField = isUpvote ? "upvoteCount" : "downvoteCount";
            const decrementField = isUpvote ? "downvoteCount" : "upvoteCount";

            await prisma.$transaction([
                // Update the rating
                prisma.commentRating.update({
                    where: { id: existingRating.id },
                    data: { isUpvote },
                }),
                // Adjust the counts on the comment
                prisma.comment.update({
                    where: { id: commentId },
                    data: {
                        [incrementField]: { increment: 1 },
                        [decrementField]: { decrement: 1 },
                    },
                }),
            ]);

            return res.status(200).json({ message: "Rating updated successfully" });
        } catch (error: any) {
            return res.status(500).json({ error: "Failed to update rating" });
        }
    }
}

export default verification(handler);
