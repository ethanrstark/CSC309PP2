import prisma from "@/utils/db";
import { verification } from "@/middleware/auth";
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "@/constants";

// Interface for request body
interface BlogPostRequestBody {
    title: string;
    description: string;
    tags?: number[]; // Tags are optional and should be an array of numbers
    templates?: number[]; // Templates are optional and should be an array of numbers
}

/*
    This API route handles requests to create a new blog post.

    API URL: /api/blog/create

    Allowed methods: POST
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    // Only allow POST method
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const user = req.user;
    const { title, description, tags, templates }: BlogPostRequestBody = req.body;

    // Validate the user input
    if (
        !title ||
        !description ||
        typeof title !== "string" ||
        typeof description !== "string" ||
        title.trim() === "" ||
        description.trim() === ""
    ) {
        return res
            .status(400)
            .json({ error: "Title and description are required and must be non-empty strings" });
    } else if (tags && (!Array.isArray(tags) || tags.some((tagId) => typeof tagId !== "number"))) {
        return res.status(400).json({ error: "Tags must be an array of ids (integers)" });
    } else if (
        templates &&
        (!Array.isArray(templates) ||
            templates.some((templateId) => typeof templateId !== "number"))
    ) {
        return res.status(400).json({ error: "Templates must be an array of ids (integers)" });
    }
    // TODO there may be an error with handling the tags and templates

    // Validate if tags exist in the database
    if (tags) {
        for (const tagId of tags) {
            const tag = await prisma.tag.findUnique({ where: { id: tagId } });
            if (!tag) {
                return res.status(404).json({ error: `Tag with id ${tagId} does not exist` });
            }
        }
    }

    // Validate if templates exist in the database
    if (templates) {
        for (const templateId of templates) {
            const template = await prisma.codeTemplate.findUnique({ where: { id: templateId } });
            if (!template) {
                return res
                    .status(404)
                    .json({ error: `Template with id ${templateId} does not exist` });
            }
        }
    }

    try {
        // Create a new blog post
        const newBlogPost = await prisma.blogPost.create({
            data: {
                title,
                description,
                authorId: user.id,
                tags: {
                    connect: tags?.map((tagId) => ({ id: tagId })) || [], // Connect the tags by their IDs
                },
                templates: {
                    connect: templates?.map((templateId) => ({ id: templateId })) || [], // Connect templates by their IDs
                },
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
                tags: true,
                templates: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        return res.status(201).json({ newBlogPost });
    } catch (error: any) {
        return res.status(500).json({ error: "Error occurred while creating the blog post" });
    }
}

export default verification(handler);
