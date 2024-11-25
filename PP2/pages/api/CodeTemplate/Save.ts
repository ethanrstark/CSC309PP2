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
    This API route handles creating a new code template, optionally associating tags and forking an existing template.

    API URL: /api/CodeTemplate/Save

    Allowed methods: POST
*/
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { title, explanation, code, file_name, language, tags }: RequestBody =
            req.body;

        const templateId = parseInt(req.query.id as string, 10); // For forked templates
        // TODO: instead of putting the id in the query, you could just put it in the body (and set to null if not forked)

        // Validate required fields
        if (!title || !explanation || !code || !file_name || !language) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // Validate language
        if (language && !VALID_LANGUAGES.includes(language)) {
            return res.status(400).json({ message: "Please provide a compatible language" });
        }

        // Create the base template
        let newTemplate = await prisma.codeTemplate.create({
            data: {
                userId: req.user.id,
                title,
                explanation,
                code,
                file_name,
                language,
            },
        });

        // TODO: The template will likely always exist in the database at this point but I left it here incase
        // you wanted to add it back as a sanity check before updating the fork or tags
        /* const existTemplate = await prisma.CodeTemplate.findUnique({
            where:{
                id:templateId
            }
        })

        if(!existTemplate){
            return res.status(400).json({error:"Template does not exist"})
        } */

        // Handle tags if provided
        if (tags) {
            // Prepare tags for the template
            const newTags: { name: string }[] = [];
            const existingTags: { name: string }[] = [];
            for (const tagName of tags) {
                const tag = await prisma.tag.findUnique({
                    where: { name: tagName },
                });

                if (!tag) {
                    newTags.push({ name: tagName });
                } else {
                    existingTags.push({ name: tagName });
                }
            }

            await prisma.codeTemplate.update({
                where: {
                    id: newTemplate.id,
                },
                data: {
                    tags: {
                        connect: existingTags,
                        create: newTags,
                    },
                },
            });
        }

        // Handle forking if templateId is provided
        if (!isNaN(templateId)) {
            newTemplate = await prisma.codeTemplate.update({
                where: {
                    id: newTemplate.id,
                },
                data: {
                    isFork: true,
                    originalId: templateId,
                },
            });
        }

        return res.status(200).json(newTemplate);
    } catch (err: any) {
        return res.status(500).json({ error: "Save unsuccessful" }); // TODO: changed to 500 status code
    }
}

export default verification(handler);

// TODO: Not sure if you still need the below comments, if not then feel free to remove them:
//need check if template already exists
//if it is, create a new template using the code, description... set forken flag to true
//else, create a brand new template
