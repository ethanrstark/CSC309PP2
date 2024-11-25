import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/db";
import { TAG_LIMIT } from "@/constants";

// Define the shape of the response
interface Tag {
    id: number;
    name: string;
}

// Define the shape of the response body
interface TagResponse {
    data: Tag[];
    pageNum: number;
    pageLimit: number;
    tagCount: number;
    error?: string;
}

/*
    This API route handles requests to retrieve all tags using pagination.

    API URL: /api/tag/

    Allowed methods: GET
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const {
        page = "1",
        limit = `${TAG_LIMIT}`,
        countTags = "false",
    } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10);
    const pageLimit = parseInt(limit, 10);

    if (countTags && countTags !== "true" && countTags !== "false") {
        return res.status(400).json({ error: "Invalid countTags query parameter" });
    }

    try {
        // Get the total number of tags if requested (else set to -1)
        const tagCount = countTags === "true" ? await prisma.tag.count() : -1;

        // Retrieve the tags based on the pagination parameters
        const tags = await prisma.tag.findMany({
            take: pageLimit,
            skip: (pageNum - 1) * pageLimit,
            orderBy: { name: "asc" },
        });

        return res.status(200).json({
            data: tags,
            pageNum,
            pageLimit,
            tagCount,
        });
    } catch (error: any) {
        return res.status(500).json({ error: "Error retrieving tags" });
    }
}
