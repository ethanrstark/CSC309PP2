import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/db";
import { CODE_TEMPLATE_LIMIT } from "@/constants";

/*
    This API route handles requests to search for code templates.

    API URL: /api/CodeTemplate/Search_all

    Allowed methods: GET
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

        // findMany all templates correspond to the filter, find legnth, return it
        const allTemplates = await prisma.codeTemplate.count({
            where: {
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

        const pagedTemplates = await prisma.codeTemplate.findMany({
            skip: (page - 1) * CODE_TEMPLATE_LIMIT,
            take: CODE_TEMPLATE_LIMIT,
            where: {
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

        // console.log(paged_templates)

        return res.status(201).json({ pagedTemplates, numTemp: allTemplates });
    } catch (err: any) {
        return res.status(500).json({ error: "Unsuccessful fetching of templates" }); // TODO: Changed to 500 status code
    }
}
