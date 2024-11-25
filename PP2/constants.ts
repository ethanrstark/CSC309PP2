import { NextApiRequest } from "next";

export const BLOG_POST_LIMIT: number = 5;
export const COMMENT_LIMIT: number = 15;
export const TAG_LIMIT: number = 5;
export const CODE_TEMPLATE_LIMIT: number = 2;

// UserPayload object type definition
export interface UserPayload {
    id: number;
    userName: string;
    email: string;
    role: "ADMIN" | "USER";
};

// Custom request type to include user property
export interface AuthenticatedRequest extends NextApiRequest {
    user: UserPayload;
}

// Array for valid languages
export const VALID_LANGUAGES = ["C", "CPP", "JAVA", "PYTHON", "JavaScript"] as const;
export type LanguageType = typeof VALID_LANGUAGES[number];

// Custom types and constants for sorting and filtering blog posts:
export type SortOptionType = Record<string, "asc" | "desc">;
export type HiddenCheckType = { isHidden: boolean } | { authorId: number };
export const validSortOrders = ['asc', 'desc'] as const;
export const validSortByFields = [
    'title',
    'createdAt',
    'updatedAt',
    'upvoteCount',
    'downvoteCount',
] as const;
