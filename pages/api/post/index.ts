import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

// POST /api/post
// Required fields in body: title
// Optional fields in body: content
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Get the session using the server-side method
  const session = await getServerSession(req, res, authOptions);

  // Check authentication
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { title, content } = req.body;

  // Validate input
  if (!title || typeof title !== "string") {
    return res
      .status(400)
      .json({ error: "Title is required and must be a string" });
  }

  try {
    // Create the post
    const result = await prisma.post.create({
      data: {
        title,
        content: typeof content === "string" ? content : null,
        published: false,
        author: { connect: { email: session.user.email } },
      },
    });
    return res.status(201).json(result);
  } catch (error) {
    // Handle errors gracefully
    return res.status(500).json({
      error: "Failed to create post",
      details: error instanceof Error ? error.message : error,
    });
  }
}
