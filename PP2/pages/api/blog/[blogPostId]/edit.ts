import prisma from "@/utils/db";
import { verification } from "@/middleware/auth";
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "@/constants";

interface UpdateBlogPostBody {
    title?: string;
    description?: string;
    newTags?: number[];
    removedTags?: number[];
    newTemplates?: number[];
    removedTemplates?: number[];
}

/*
    This API route handles requests to update a blog post with blogPostId.

    API URL: /api/blog/[blogPostId]/edit

    Allowed methods: PUT
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== "PUT") {
        res.setHeader("Allow", ["PUT"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const postId = parseInt(req.query.blogPostId as string, 10);
    const user = req.user;

    try {
        // Fetch the blog post to validate user permissions
        const post = await prisma.blogPost.findUnique({
            where: { id: postId },
            select: { authorId: true },
        });

        if (!post) {
            return res.status(404).json({ error: "Blog post not found" });
        }

        if (post.authorId !== user.id) {
            return res.status(403).json({ error: "Forbidden, user is not the post's author" });
        }

        const {
            title,
            description,
            newTags = [],
            removedTags = [],
            newTemplates = [],
            removedTemplates = [],
        }: UpdateBlogPostBody = req.body;

        // Validate the body parameters
        if (
            (title && typeof title !== "string") ||
            (description && typeof description !== "string") ||
            !Array.isArray(newTags) ||
            !Array.isArray(removedTags) ||
            !Array.isArray(newTemplates) ||
            !Array.isArray(removedTemplates) ||
            newTags.some((tagId) => typeof tagId !== "number") ||
            removedTags.some((tagId) => typeof tagId !== "number") ||
            newTemplates.some((templateId) => typeof templateId !== "number") ||
            removedTemplates.some((templateId) => typeof templateId !== "number")
        ) {
            return res.status(400).json({ error: "Invalid input data" });
        }

        // Check if newTags and newTemplates exist in the database
        for (const tagId of newTags) {
            const tagExists = await prisma.tag.findUnique({ where: { id: tagId } });
            if (!tagExists) {
                return res.status(404).json({ error: `Tag with id ${tagId} does not exist` });
            }
        }

        for (const templateId of newTemplates) {
            const templateExists = await prisma.codeTemplate.findUnique({
                where: { id: templateId },
            });
            if (!templateExists) {
                return res
                    .status(404)
                    .json({ error: `Template with id ${templateId} does not exist` });
            }
        }

        // Check if removedTags and removedTemplates exist in the database
        for (const tagId of removedTags) {
            const tagExists = await prisma.tag.findUnique({ where: { id: tagId } });
            if (!tagExists) {
                return res.status(404).json({ error: `Tag with id ${tagId} does not exist` });
            }
        }

        for (const templateId of removedTemplates) {
            const templateExists = await prisma.codeTemplate.findUnique({
                where: { id: templateId },
            });
            if (!templateExists) {
                return res
                    .status(404)
                    .json({ error: `Template with id ${templateId} does not exist` });
            }
        }

        // Construct the update data
        const updatedData: Record<string, any> = {
            tags: {
                connect: newTags.map((tagId) => ({ id: tagId })),
                disconnect: removedTags.map((tagId) => ({ id: tagId })),
            },
            templates: {
                connect: newTemplates.map((templateId) => ({ id: templateId })),
                disconnect: removedTemplates.map((templateId) => ({ id: templateId })),
            },
        };

        // Conditionally add title and description if they are a non-empty string
        if (title) {
            updatedData.title = title;
        }
        if (description) {
            updatedData.description = description;
        }

        // Update the blog post
        const updatedPost = await prisma.blogPost.update({
            where: { id: postId },
            data: updatedData,
        }); // TODO may want to return more blogPost attributes in the response depending on frontend

        return res.status(200).json(updatedPost);
    } catch (error: any) {
        return res.status(500).json({ error: "Error occurred while updating the blog post" });
    }
}

export default verification(handler);
