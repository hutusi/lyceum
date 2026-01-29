import { NextRequest, NextResponse } from "next/server";
import { eq, desc, like, and, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { sharedTools, toolTags, sharedToolTags, toolVersions, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateInstallCommand(type: string, name: string, repoUrl?: string): string {
  const slug = generateSlug(name);
  switch (type) {
    case "skill":
      return `claude skill add ${repoUrl || `lyceum/${slug}`}`;
    case "agent":
      return `claude agent install ${repoUrl || `lyceum/${slug}`}`;
    case "mcp":
      return `claude mcp add ${repoUrl || `lyceum/${slug}`}`;
    default:
      return `claude install ${repoUrl || `lyceum/${slug}`}`;
  }
}

// GET /api/tools - List all approved tools with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const status = searchParams.get("status") || "approved";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];

    if (status !== "all") {
      conditions.push(eq(sharedTools.status, status as "pending" | "approved" | "featured" | "rejected"));
    }

    if (type && type !== "all") {
      conditions.push(eq(sharedTools.type, type as "skill" | "agent" | "mcp"));
    }

    if (search) {
      conditions.push(
        or(
          like(sharedTools.name, `%${search}%`),
          like(sharedTools.description, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get tools with user info
    const tools = await db
      .select({
        id: sharedTools.id,
        name: sharedTools.name,
        slug: sharedTools.slug,
        description: sharedTools.description,
        type: sharedTools.type,
        version: sharedTools.version,
        repoUrl: sharedTools.repoUrl,
        installCommand: sharedTools.installCommand,
        downloads: sharedTools.downloads,
        stars: sharedTools.stars,
        status: sharedTools.status,
        publishedAt: sharedTools.publishedAt,
        createdAt: sharedTools.createdAt,
        userId: sharedTools.userId,
        userName: users.name,
        userImage: users.image,
      })
      .from(sharedTools)
      .leftJoin(users, eq(sharedTools.userId, users.id))
      .where(whereClause)
      .orderBy(desc(sharedTools.stars), desc(sharedTools.downloads))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(sharedTools)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    // Get tags for each tool
    const toolsWithTags = await Promise.all(
      tools.map(async (tool) => {
        const tags = await db
          .select({
            id: toolTags.id,
            name: toolTags.name,
            slug: toolTags.slug,
          })
          .from(sharedToolTags)
          .innerJoin(toolTags, eq(sharedToolTags.tagId, toolTags.id))
          .where(eq(sharedToolTags.toolId, tool.id));

        return {
          ...tool,
          tags,
          author: {
            name: tool.userName,
            image: tool.userImage,
          },
        };
      })
    );

    return NextResponse.json({
      tools: toolsWithTags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching tools:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tools - Create a new tool (requires authentication)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, readme, type, repoUrl, configSchema, tags } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    if (!["skill", "agent", "mcp"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be skill, agent, or mcp" },
        { status: 400 }
      );
    }

    // Generate slug and check uniqueness
    let slug = generateSlug(name);
    const existingTool = await db.query.sharedTools.findFirst({
      where: eq(sharedTools.slug, slug),
    });

    if (existingTool) {
      slug = `${slug}-${nanoid(6)}`;
    }

    const installCommand = generateInstallCommand(type, name, repoUrl);
    const toolId = nanoid();

    // Create the tool
    const newTool = await db
      .insert(sharedTools)
      .values({
        id: toolId,
        userId: session.user.id,
        name,
        slug,
        description,
        readme,
        type,
        version: "1.0.0",
        repoUrl,
        installCommand,
        configSchema: configSchema ? JSON.stringify(configSchema) : null,
        status: "pending",
      })
      .returning();

    // Create initial version
    await db.insert(toolVersions).values({
      id: nanoid(),
      toolId,
      version: "1.0.0",
      changelog: "Initial release",
      installCommand,
      configSchema: configSchema ? JSON.stringify(configSchema) : null,
      isLatest: true,
    });

    // Handle tags
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        const tagSlug = generateSlug(tagName);

        // Find or create tag
        let tag = await db.query.toolTags.findFirst({
          where: eq(toolTags.slug, tagSlug),
        });

        if (!tag) {
          const newTag = await db
            .insert(toolTags)
            .values({
              id: nanoid(),
              name: tagName,
              slug: tagSlug,
            })
            .returning();
          tag = newTag[0];
        }

        // Link tag to tool
        await db.insert(sharedToolTags).values({
          toolId,
          tagId: tag.id,
        });
      }
    }

    return NextResponse.json(
      {
        message: "Tool submitted successfully. Awaiting admin approval.",
        tool: newTool[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tool:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
