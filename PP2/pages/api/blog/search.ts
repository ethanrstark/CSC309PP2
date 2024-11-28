import prisma from "@/utils/db";
import { verifyAccessToken } from "@/utils/auth";
import { NextApiRequest, NextApiResponse } from "next";
import {
    BLOG_POST_LIMIT,
    validSortOrders,
    validSortByFields,
    SortOptionType,
    HiddenCheckType,
    UserPayload,
} from "@/constants";


/*
    This API route handles requests to retrieve blog posts (using pagination) that match a search query
    based on title, content, tags, or code templates.

    API URL: /api/blog/search

    Allowed methods: GET
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const token = req.headers.authorization || "";
    const user: UserPayload | null = token ? (verifyAccessToken(token) as unknown as UserPayload) : null;

    let {
        title = "",
        description = "",
        tags,
        templates,
    } = req.query as any;

    const {
        page = "1",
        limit = `${BLOG_POST_LIMIT}`,
        sortBy = "upvoteCount",
        sortOrder = "desc",
        countPosts = "false",
    } = req.query as Record<string, string>;

    const pageNum = parseInt(page, 10);
    const pageLimit = parseInt(limit, 10);

    // Validate the query parameters
    if (
        (title && typeof title !== "string") ||
        (description && typeof description !== "string") ||
        (tags && typeof tags !== "string") ||
        (templates && typeof templates !== "string")
    ) {
        return res.status(400).json({ error: "Search parameters should be strings" });
    } else if (
        !sortOrder ||
        !sortBy ||
        !validSortOrders.includes(sortOrder as (typeof validSortOrders)[number]) ||
        !validSortByFields.includes(sortBy as (typeof validSortByFields)[number])
    ) {
        return res.status(400).json({ error: "Invalid sorting criteria" });
    } else if (countPosts !== "true" && countPosts !== "false") {
        return res.status(400).json({ error: "Invalid countPosts query parameter" });
    }

    try {
        title = title ? decodeURIComponent(title) : null;
        description = description ? decodeURIComponent(description) : null;
        tags = tags ? decodeURIComponent(tags) : null;
        templates = templates ? decodeURIComponent(templates) : null;
    } catch (e) {
        return res.status(400).json({ error: "Invalid query parameter encoding" });
    }
    
    const sortOptions: SortOptionType[] = [
        { [sortBy as string]: sortOrder as "asc" | "desc" }, // Primary sorting criterion
        { id: "asc" }, // Secondary unique sort by id to guarantee stable sorting
    ];

    const hiddenCheck: HiddenCheckType[] = [{ isHidden: false }];
    if (user) {
        hiddenCheck.push({ authorId: user.id });
    }

    // Retrieve blog posts that are either not hidden or authored by the user
    const hideOptions = {
        OR: hiddenCheck,
    };

    // Split tags and templates
    const tagList = tags ? tags.split(",") : null;
    const templateList = templates ? templates.split(",") : null;

    // Define search criteria

    type SearchCriterion =
        | { title?: { contains: string } }
        | { description?: { contains: string } }
        | {
              tags?: {
                  some: {
                      name: { in: string[] };
                  };
              };
          }
        | {
              templates?: {
                  some: {
                      title: { in: string[] };
                  };
              };
          };

    type SearchCriteria = SearchCriterion[];
    let searchCriteria: SearchCriteria = [
        { title: { contains: title } },
        { description: { contains: description } },
    ];

    if (tagList && Array.isArray(tagList) && tagList.length > 0) {
        searchCriteria.push({
            tags: {
                some: {
                    name: { in: tagList },
                },
            },
        });
    }

    if (templateList && Array.isArray(templateList) && templateList.length > 0) {
        searchCriteria.push({
            templates: {
                some: {
                    title: { in: templateList },
                },
            },
        });
    }

    const searchOptions = {
        AND: searchCriteria,
    };

    try {
        // Get the total number of posts if requested (else set to -1)
        const postCount =
            countPosts === "false"
                ? -1
                : await prisma.blogPost.count({
                      where: {
                          AND: [hideOptions, searchOptions],
                      },
                  });

        // Fetch blog posts
        const blogPosts = await prisma.blogPost.findMany({
            where: {
                AND: [hideOptions, searchOptions],
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
            skip: (pageNum - 1) * pageLimit, // Skip to the right page
            orderBy: sortOptions, // Dynamic sorting based on query params
        });

        res.status(200).json({
            blogPosts,
            postCount,
        });
    } catch (error: any) {
        res.status(500).json({ error: "Internal server error" });
    }
}
