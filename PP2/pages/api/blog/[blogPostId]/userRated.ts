import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/db";
import { verifyAccessToken } from "@/utils/auth";
import { UserPayload } from "@/constants";


/*
    This API route handles checks if the user has already rated the blog post with blogPostId.

    API URL: /api/blog/[blogPostId]/userRated

    Allowed methods: GET
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Check if the method is GET
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const token = req.headers.authorization || "";
    const user: UserPayload | null = token ? (verifyAccessToken(token) as unknown as UserPayload) : null;

    // Parse the blogPostId from the query and user info from the request
    const postId = parseInt(req.query.blogPostId as string);


    // Check if the user has already rated the blog post
    let existingRating = null;
    if (user) {
        existingRating = await prisma.blogRating.findUnique({
            where: { userId_postId: { userId: user.id, postId } },
        });
    }

    return res.status(200).json({ hasRated: !!existingRating, isUpvote: existingRating?.isUpvote });
}
