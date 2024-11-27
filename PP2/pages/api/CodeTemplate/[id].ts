import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/db";

/*
    This API route handles requests to fetch a specific code template and its associated blog posts.

    API URL: /api/CodeTemplate/[id]

    Allowed methods: GET
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const id = parseInt(req.query.id as string, 10);

        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid template ID" });
        }

        const template = await prisma.codeTemplate.findUnique({
            where: { id },
            include: {
                blogPosts: {include:{author:true}},
                user:true,
                tags:true
            },
        });

        if (!template) {
            return res.status(404).json({ message: "No template found" });
        }

        return res.status(200).json(template);
    } catch (err: any) {
        return res.status(500).json({ error: "Unsuccessful fetching of template" }); // TODO: Changed to 500 status code
    }
}
