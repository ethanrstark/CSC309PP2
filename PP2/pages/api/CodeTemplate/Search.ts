import { NextApiResponse } from "next";
import prisma from "@/utils/db";
import { verification } from "@/middleware/auth";
import { AuthenticatedRequest, CODE_TEMPLATE_LIMIT } from "@/constants";

/*
    This API route handles fetching paginated and filtered code templates for the authenticated user

    API URL: /api/CodeTemplate/Search

    Allowed methods: GET
    Authorization: Requires the user to be authenticated.
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { title, tags, explanation } = req.query as Record<string, string>;
        const page = parseInt(req.query.page as string, 10);
        const tagArray = tags ? tags.split(",").map((tag) => tag.trim()) : [];

        // console.log(tagArray)

        if (isNaN(page) || page < 1) {
            return res.status(400).json({ error: "Invalid page number" });
        }

        const allTemplates = await prisma.codeTemplate.count({
            where: {
                userId: req.user.id,
                title: { contains: title },
                explanation: { contains: explanation },
                ...(tags
                    ? {
                          tags: {
                              some: { name: { in: tagArray } },
                          },
                      }
                    : {}),
            },
        });

        // console.log(allTemplates)

        // Fetch templates with pagination and filtering based on user input
        const pagedTemplates = await prisma.codeTemplate.findMany({
            skip: (page - 1) * CODE_TEMPLATE_LIMIT,
            take: CODE_TEMPLATE_LIMIT,
            where: {
                userId: req.user.id,
                title: { contains: title },
                explanation: { contains: explanation },
                ...(tags
                    ? {
                          tags: {
                              some: { name: { in: tagArray } },
                          },
                      }
                    : {}),
            },
            include: {
                tags: true,
                user: true,
            },
        });

        if (pagedTemplates.length === 0) {
            return res.status(200).json({ message: "No templates found", numTemp: allTemplates });
        }

        return res.status(201).json({ pagedTemplates, numTemp: allTemplates });
    } catch (err: any) {
        return res.status(500).json({ error: "Unsuccessful fetching of templates" }); // TODO: changed to 500 status code
    }
}

export default verification(handler);

// TODO: Not sure if you still need the below comments, if not then feel free to remove them:
//filter through User to find the user associated with this username
//fitler through code template for userid
//if the user has provided filters by titles, description, tags - filter
//o/w return all code templates
