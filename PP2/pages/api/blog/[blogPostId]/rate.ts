import { NextApiResponse } from "next";
import prisma from "@/utils/db";
import { verification } from "@/middleware/auth";
import { AuthenticatedRequest } from "@/constants";

// Define the request body interface for type checking
interface RateRequestBody {
    isUpvote: boolean;
}

/*
    This API route handles requests to create a new blog post rating for the user on the 
    blog post with blogPostId if they haven'y already voted, or updating the user's current 
    vote on the blog post with blogPostId if they have already voted.

    API URL: /api/blog/[blogPostId]/rate

    Allowed methods: POST, PUT
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    // Check if the method is POST or PUT
    if (req.method !== "POST" && req.method !== "PUT") {
        res.setHeader("Allow", ["POST", "PUT"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Parse the blogPostId from the query and user info from the request
    const postId = parseInt(req.query.blogPostId as string);
    const user = req.user;
    const { isUpvote } = req.body as RateRequestBody;

    // Validate the rating value
    if (isUpvote === null || isUpvote === undefined || typeof isUpvote !== "boolean") {
        return res.status(400).json({ error: "Invalid rating value" });
    }

    // Handle POST request (creating a new rating)
    if (req.method === "POST") {
        const existingRating = await prisma.blogRating.findUnique({
            where: { userId_postId: { userId: user.id, postId } },
        });

        if (existingRating) {
            return res.status(400).json({ error: "User has already rated this post" });
        }

        const fieldToIncrement = isUpvote ? "upvoteCount" : "downvoteCount";
        try {
            await prisma.$transaction([
                // Create the rating
                prisma.blogRating.create({
                    data: {
                        isUpvote,
                        postId,
                        userId: user.id,
                    },
                }),

                // Increment the corresponding blog post's rating count
                prisma.blogPost.update({
                    where: { id: postId },
                    data: { [fieldToIncrement]: { increment: 1 } },
                }),
            ]);

            return res.status(200).json({ message: "Rating created successfully" });
        } catch (error: any) {
            return res.status(500).json({ error: "Failed to create rating" });
        }
    } else {
        // Handle PUT request (updating an existing rating)
        try {
            const existingRating = await prisma.blogRating.findUnique({
                where: {
                    userId_postId: {
                        userId: user.id,
                        postId,
                    },
                },
            });

            if (existingRating) {
                if (existingRating.isUpvote === isUpvote) {
                    return res
                        .status(400)
                        .json({ error: "User has already rated this post with the same value" });
                }

                // Determine fields to increment and decrement
                const incrementField = isUpvote ? "upvoteCount" : "downvoteCount";
                const decrementField = isUpvote ? "downvoteCount" : "upvoteCount";

                await prisma.$transaction([
                    // Update the rating
                    prisma.blogRating.update({
                        where: { id: existingRating.id },
                        data: { isUpvote },
                    }),

                    // Update the blog post's rating counts
                    prisma.blogPost.update({
                        where: { id: postId },
                        data: {
                            [incrementField]: { increment: 1 },
                            [decrementField]: { decrement: 1 },
                        },
                    }),
                ]);
            } else {
                return res.status(400).json({ error: "User has not previously rated this post" });
            }

            return res.status(200).json({ message: "Rating updated successfully" });
        } catch (error: any) {
            return res.status(500).json({ error: "Failed to update rating" });
        }
    }
}

export default verification(handler);
