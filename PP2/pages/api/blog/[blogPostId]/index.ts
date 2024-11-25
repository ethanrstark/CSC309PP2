import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/db";

/*
    This API route handles requests to retrieve a blog posts by id.

    API URL: /api/blog/[blogPostId]/

    Allowed methods: GET
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Parse blogPostId from query and ensure it's a valid number
    const postId = parseInt(req.query.blogPostId as string);

    // Check if postId is valid
    if (isNaN(postId)) {
        return res.status(400).json({ error: "Invalid blog post ID" });
    }

    try {
        // Retrieve the blog post from the database
        const post = await prisma.blogPost.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        id: true,
                        userName: true,
                        avatar: true,
                        role: true,
                    },
                },
                tags: true,
                templates: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ error: "Blog post not found" });
        }

        return res.status(200).json(post);
    } catch (error: any) {
        return res.status(500).json({ error: "Error occurred while retrieving blog post" });
    }
}
