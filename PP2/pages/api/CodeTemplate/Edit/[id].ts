import { NextApiResponse } from "next";
import prisma from "@/utils/db";
import { verification } from "@/middleware/auth";
import { AuthenticatedRequest, VALID_LANGUAGES, LanguageType } from "@/constants";

interface RequestBody {
    title: string;
    explanation: string;
    code: string;
    file_name: string;
    language: LanguageType;
    tags?: string[];
}

/*
    This API route handles requests to edit a code template.

    API URL: /api/CodeTemplate/Edit/[id]

    Allowed methods: POST
    Authorization: Requires the user to be authenticated and be the owner of the template.
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const templateId = parseInt(req.query.id as string, 10);

        if (isNaN(templateId)) {
            return res.status(400).json({ error: "Invalid template ID" });
        }

        const { title, explanation, code, file_name, language, tags } =
            req.body as RequestBody;

        // TODO: Transform environment string to the appropriate type
        // let environment;
        // if (environmentName) {
        //     environment = {
        //         connectOrCreate: {
        //             where: { name: environmentName },
        //             create: { name: environmentName },
        //         },
        //     };
        // }

        if (language && !VALID_LANGUAGES.includes(language)) {
            return res.status(400).json({ error: "Please provide a compatible language" });
        }

        // Validate template existence and ownership
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
        } // TODO: You had this if check commented out, but I wasn't sure if it should be uncommented or not

        // Prepare tags for the template
        if (tags){
            const newTags: { name: string }[] = [];
            const existingTags: { name: string }[] = [];
            for (const tagName of tags || []) {
                const tag = await prisma.tag.findUnique({
                    where: { name: tagName },
                });

                if (!tag) {
                    newTags.push({ name: tagName });
                } else {
                    existingTags.push({ name: tagName });
                }
            }
            // Update the template
            const updatedTemplate = await prisma.codeTemplate.update({
                where: { id: templateId },
                data: {
                    title,
                    explanation,
                    code,
                    file_name,
                    language,
                    tags: {
                        connect: existingTags,
                        create: newTags,
                    },
                },
            });

            return res.status(200).json(updatedTemplate);
        }else{
            // Update the template
            const updatedTemplate = await prisma.codeTemplate.update({
                where: { id: templateId },
                data: {
                    title,
                    explanation,
                    code,
                    file_name,
                    language
                   
                },
            });

            return res.status(200).json(updatedTemplate);
        }
        

        
    } catch (error: any) {
        return res.status(500).json({ error: "Code template update unsuccessful" });
        // TODO: I changed it to a 500 status code, but you had it as a 400 status code
    }
}

export default verification(handler);
