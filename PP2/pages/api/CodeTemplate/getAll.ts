import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/db";

/*
    This API route handles requests to fetch all code templates.

    API URL: /api/CodeTemplate/getAll

    Allowed methods: GET
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const templates = await prisma.codeTemplate.findMany({
            select: {
                id: true,
                title: true,
          },
        });

        if (templates.length === 0) {
            return res.status(200).json({ message: "No templates found", templates: [] });
        }

        return res.status(200).json(templates);
    } catch (err: any) {
        return res.status(500).json({ error: "Failed to fetch templates" });
    }
}
