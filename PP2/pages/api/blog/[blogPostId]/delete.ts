import prisma from "@/utils/db";
import { verification } from "@/middleware/auth";
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "@/constants";
import { Prisma } from "@prisma/client";

/*
    This API route handles requests to delete a blog post with blogPostId.

    API URL: /api/blog/[blogPostId]/delete

    Allowed methods: DELETE
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== "DELETE") {
        res.setHeader("Allow", ["DELETE"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const postId = parseInt(req.query.blogPostId as string, 10);
    const user = req.user;

    if (isNaN(postId)) {
        return res.status(400).json({ error: "Invalid blog post ID" });
    }

    try {
        // Find the blog post and ensure the user is the author before deleting it
        const post = await prisma.blogPost.findUnique({
            where: {
                id: postId,
            },
            select: {
                authorId: true,
            },
        });

        if (!post) {
            return res.status(404).json({ error: "Blog post not found" });
        }

        if (post.authorId !== user.id) {
            return res.status(403).json({
                error: "Forbidden, user is not the post's author",
            });
        }

        const deletedPost = await prisma.blogPost.delete({
            where: {
                id: postId,
            },
        }); // TODO may want to return more blogPost attributes in the response depending on frontend

        return res.status(200).json(deletedPost);
    } catch (error: unknown) {
        if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025") {
            // The blog post was not found
            return res.status(404).json({ error: "Blog post not found" });
        }

        return res.status(500).json({ error: "An error occurred while deleting the blog post" });
    }
}

export default verification(handler);
