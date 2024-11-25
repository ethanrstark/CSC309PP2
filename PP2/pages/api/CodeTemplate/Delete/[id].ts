import { NextApiResponse } from "next";
import prisma from "@/utils/db";
import { verification } from "@/middleware/auth";
import { AuthenticatedRequest } from "@/constants";

/*
    This API route handles requests to delete a code template.

    API URL: /api/CodeTemplate/Delete/[id]

    Allowed methods: DELETE
    Authorization: Requires the user to be authenticated and be the owner of the template.
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== "DELETE") {
        res.setHeader("Allow", ["DELETE"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const templateId = parseInt(req.query.id as string, 10);

        if (isNaN(templateId)) {
            return res.status(400).json({ error: "Invalid template ID" });
        }

        // Retrieve the code template to validate ownership
        const template = await prisma.codeTemplate.findUnique({
            where: { id: templateId },
        });

        if (!template) {
            return res.status(404).json({ error: "Code template does not exist" });
        }
        
        if (template.userId !== req.user.id) {
            return res
                .status(403)
                .json({ error: "Forbidden: You are not the owner of this template" });
        }

        // Delete the code template
        await prisma.codeTemplate.delete({
            where: { id: templateId },
        });

        return res.status(200).json({ message: "Template deleted successfully" });
    } catch (error: any) {
        return res
            .status(500)
            .json({ error: "An error occurred while attempting to delete the template" });
        // TODO I changed error code to 500, if you want to change it back ig you can, I just don't think its supposed to be 400
    }
}

export default verification(handler);
