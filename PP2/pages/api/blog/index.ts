import prisma from "@/utils/db";
import { verifyAccessToken } from "@/utils/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { BLOG_POST_LIMIT, validSortOrders, validSortByFields, SortOptionType, HiddenCheckType, UserPayload } from '@/constants';


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
    const user: UserPayload | null = token ? (verifyAccessToken(token) as unknown as UserPayload) : null;
    const {
        page = "1",
        limit = `${BLOG_POST_LIMIT}`,
        sortBy = "upvoteCount",
        sortOrder = "desc",
        countPosts = "false",
        userId = "0",
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

    if (userId !== "0" && await prisma.user.findUnique({ where: { id: parseInt(userId) } }) == null) {
        return res.status(404).json({ error: "User not found" });
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
        let postCount;
        let blogPosts;
        if (userId == "0") {
            // Get the total number of posts if requested (else set to -1)
            postCount = countPosts === "true"
                ? await prisma.blogPost.count({ where: { OR: hiddenCheck } })
                : -1;

            blogPosts = await prisma.blogPost.findMany({
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
        } else {
            // Get the total number of posts that user with userId authored if requested (else set to -1)
            postCount = countPosts === "true"
                ? await prisma.blogPost.count({ where: { authorId: parseInt(userId) } })
                : -1;

            // Retrieve blog posts that user with userId has authored
            blogPosts = await prisma.blogPost.findMany({
                where: { authorId: parseInt(userId) },
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
        }
        res.status(200).json({
            blogPosts,
            postCount,
        });
    } catch (error: any) {
        return res.status(500).json({ error: "Error retrieving blog posts" });
    }
}
