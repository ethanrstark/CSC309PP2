import prisma from "@/utils/db";
import { verifyAccessToken } from "@/utils/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { BLOG_POST_LIMIT, validSortOrders, validSortByFields, SortOptionType, HiddenCheckType } from '@/constants';


/*
    This API route handles requests to retrieve all blog posts using pagination.

    API URL: /api/blog/

    Allowed methods: GET
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const token = req.headers.authorization || "";
    const user = token ? verifyAccessToken(token) : null;
    const {
        page = "1",
        limit = `${BLOG_POST_LIMIT}`,
        sortBy = "upvoteCount",
        sortOrder = "desc",
        countPosts = "false",
    } = req.query as Record<string, string>;

    const pageNum = parseInt(page as string, 10);
    const pageLimit = parseInt(limit as string, 10);

    // Validate the query parameters
    if (
        !sortOrder ||
        !sortBy ||
        !validSortOrders.includes(sortOrder as (typeof validSortOrders)[number]) ||
        !validSortByFields.includes(sortBy as (typeof validSortByFields)[number])
    ) {
        return res.status(400).json({ error: "Invalid sorting criteria" });
    } else if (countPosts !== "true" && countPosts !== "false") {
        return res.status(400).json({ error: "Invalid countPosts query parameter" });
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
        // Get the total number of posts if requested (else set to -1)
        const postCount =
            countPosts === "true"
                ? await prisma.blogPost.count({ where: { OR: hiddenCheck } })
                : -1;

        const blogPosts = await prisma.blogPost.findMany({
            where: {
                OR: hiddenCheck, // Retrieve blog posts that are either not hidden or authored by the user
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
                tags: true,
                templates: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            take: pageLimit,
            skip: (pageNum - 1) * pageLimit,
            orderBy: sortOptions,
        });

        res.status(200).json({
            data: blogPosts,
            pageNum,
            pageLimit,
            postCount,
        });
    } catch (error: any) {
        return res.status(500).json({ error: "Error retrieving blog posts" });
    }
}
