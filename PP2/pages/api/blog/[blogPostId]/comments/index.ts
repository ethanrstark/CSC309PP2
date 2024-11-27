import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/db";
import { verifyAccessToken } from "@/utils/auth";
import { UserPayload } from "@/constants";
import { COMMENT_LIMIT, SortOptionType, HiddenCheckType } from "@/constants";

/*
    This API route handles requests to retrieve all comments (using pagination) on the blog post with blogPostId.

    API URL: /api/blog/[blogPostId]/comments/

    Allowed methods: GET
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const token = req.headers.authorization;
    const user: UserPayload | null = token ? (verifyAccessToken(token) as unknown as UserPayload) : null;

    if (!req.query.blogPostId) {
        return res.status(400).json({ error: "Missing blogPostId parameter" });
    }

    const blogPostId = parseInt(req.query.blogPostId as string);
    const {
        page = "1",
        limit = `${COMMENT_LIMIT}`,
        sortBy = "upvoteCount",
        sortOrder = "desc",
        countComments = "false",
        parentId = null,
    } = req.query as Record<string, string>;

    const pageNum = parseInt(page, 10);
    const pageLimit = parseInt(limit, 10);
    const validSortOrders = ["asc", "desc"] as const;
    const validSortByFields = ["createdAt", "updatedAt", "upvoteCount", "downvoteCount"] as const;

    // Validate query parameters
    if (
        !validSortOrders.includes(sortOrder as "asc" | "desc") ||
        !validSortByFields.includes(
            sortBy as "createdAt" | "updatedAt" | "upvoteCount" | "downvoteCount"
        )
    ) {
        return res.status(400).json({ error: "Invalid sorting criteria" });
    }

    if (countComments !== "true" && countComments !== "false") {
        return res.status(400).json({ error: "Invalid countComments query parameter" });
    }

    const processedParentId =
        parentId === null || parentId === undefined || parentId === ""
            ? null
            : parseInt(parentId, 10);
    if (processedParentId !== null && isNaN(processedParentId)) {
        return res.status(400).json({ error: "Invalid parentId query parameter" });
    }

    const sortOptions: SortOptionType[] = [
        { [sortBy as string]: sortOrder as "asc" | "desc" }, // Primary sorting criterion
        { id: "asc" }, // Secondary unique sort by id to guarantee stable sorting
    ];

    const hiddenCheck: HiddenCheckType[] = [{ isHidden: false }];
    if (user) {
        hiddenCheck.push({ authorId: user.id });
    }

    try {
        const commentCount =
            countComments === "false"
                ? -1
                : await prisma.comment.count({
                      where: {
                          AND: [{ postId: blogPostId}, { OR: hiddenCheck }, { parentId: processedParentId }],
                      },
                  });

        const comments = await prisma.comment.findMany({
            where: {
                AND: [{ postId: blogPostId}, { OR: hiddenCheck }, { parentId: processedParentId }],
            },
            include: {
                author: {
                    select: {
                        id: true,
                        userName: true,
                        avatar: true,
                        role: true,
                    },
                },
            },
            take: pageLimit,
            skip: (pageNum - 1) * pageLimit, // Skip to the right page
            orderBy: sortOptions, // Dynamic sorting based on query params
        });

        res.status(200).json({
            comments,
            commentCount,
        });
    } catch (error: any) {
        return res.status(500).json({ error: "Error retrieving comments" });
    }
}
