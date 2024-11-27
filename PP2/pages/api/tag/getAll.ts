import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/db";

/*
    This API route handles requests to retrieve all tags.

    API URL: /api/tag/getAll

    Allowed methods: GET
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Retrieve all tags without pagination
        const tags = await prisma.tag.findMany({
            orderBy: { name: "asc" }, // optional: to order tags alphabetically by name
        });

        if (tags.length === 0) {
            return res.status(200).json({ message: "No tags found" });
        }

        return res.status(200).json(tags);
    } catch (error: any) {
        return res.status(500).json({ error: "Error retrieving tags" });
    }
}
