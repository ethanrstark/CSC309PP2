import prisma from "@/utils/db";
import { verificationAdmin } from "@/middleware/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { BLOG_POST_LIMIT } from "@/constants";

// API endpoint for viewing reports
// Since in admin directory this endpoint should only be reachable by a user with ADMIN role

// Type for the query parameters
interface QueryParams {
    page?: string;
    limit?: string;
    sortOrder?: "asc" | "desc";
    posts?: string;
    comments?: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Get method for getting posts sorted by reports
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        // Destructure and parse query parameters
        const {
            page = "1",
            limit = `${BLOG_POST_LIMIT}`,
            sortOrder = "desc",
            posts = "true",
            comments = "true",
        }: QueryParams = req.query;

        const pageNum: number = parseInt(page);
        const pageLimit: number = parseInt(limit);
        let reportedPs: Array<any> = [];
        let reportedCs: Array<any> = [];

        if (posts === "true") {
            const reportedPosts = await prisma.blogPost.findMany({
                where: {
                    reports: {
                        some: {},
                    },
                },
                include: {
                    reports: true,
                },
                orderBy: {
                    reports: {
                        _count: sortOrder,
                    },
                },
                take: pageLimit,
                skip: (pageNum - 1) * pageLimit, // Skip to the right page
            });
            reportedPs = reportedPosts;
        }

        if (comments === "true") {
            const reportedComments = await prisma.comment.findMany({
                where: {
                    reports: {
                        some: {},
                    },
                },
                include: {
                    reports: true,
                },
                orderBy: {
                    reports: {
                        _count: sortOrder,
                    },
                },
                take: pageLimit,
                skip: (pageNum - 1) * pageLimit, // Skip to the right page
            });
            reportedCs = reportedComments;
        }

        return res.status(200).json({ reportedPs, reportedCs });
    } catch (error: any) {
        return res.status(400).json({ message: "Invalid information" }); // TODO same here I think it should be 500 error
    }
}

// Function to get blog posts sorted by reports
export async function getBlogPostsByReports(): Promise<any[] | { error: string }> {
    try {
        const blogPosts = await prisma.blogPost.findMany({
            where: {
                reports: {
                    some: {},
                },
            },
            orderBy: {
                reports: {
                    _count: "desc",
                },
            },
        });

        return blogPosts;
    } catch (error: any) {
        return { error: "Error getting blog posts" };
    }
}

// Function to get comments sorted by reports
export async function getCommentsByReports(): Promise<any[] | { error: string }> {
    try {
        const comments = await prisma.comment.findMany({
            where: {
                reports: {
                    some: {},
                },
            },
            orderBy: {
                reports: {
                    _count: "desc",
                },
            },
        });

        return comments;
    } catch (error: any) {
        return { error: "Error getting comments" };
    }
}

export default verificationAdmin(handler);
