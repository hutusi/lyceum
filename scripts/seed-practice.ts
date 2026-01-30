import { db } from "../src/lib/db";
import { practiceTopics, discussions, comments, users } from "../src/lib/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

const sampleTopics = [
  {
    title: "Build a Chatbot with OpenAI API",
    slug: "build-chatbot-openai",
    description: "Create a simple chatbot using the OpenAI API with streaming responses. Learn to handle API calls, manage conversation context, and implement real-time streaming.",
    difficulty: "easy" as const,
    category: "AI Integration",
    discussions: [
      {
        title: "How to handle streaming responses in Next.js?",
        content: "I'm trying to implement streaming responses from OpenAI in my Next.js app. The API call works fine, but I can't figure out how to stream the response to the frontend. Has anyone done this successfully?\n\nI've tried using ReadableStream but the text just appears all at once instead of streaming word by word.",
      },
      {
        title: "Best practices for conversation context management",
        content: "What's the best way to manage conversation history when building a chatbot? Should I store all messages in state, use a database, or is there a better approach?\n\nMy current implementation sends the full conversation history with each request, but this seems inefficient for long conversations.",
      },
    ],
  },
  {
    title: "Implement RAG System",
    slug: "implement-rag-system",
    description: "Build a Retrieval-Augmented Generation system with vector embeddings. Learn about document chunking, embedding generation, vector search, and context-aware responses.",
    difficulty: "medium" as const,
    category: "AI Agents",
    discussions: [
      {
        title: "Best vector database for small projects?",
        content: "I'm building a RAG system for a personal project and trying to decide which vector database to use. I've looked at Pinecone, Weaviate, and Chroma.\n\nFor a small project (maybe 10k documents), which would you recommend? Cost and ease of setup are important factors for me.",
      },
      {
        title: "Optimal chunk size for document splitting",
        content: "I'm experimenting with different chunk sizes for my RAG system. Currently using 500 tokens with 50 token overlap, but results are inconsistent.\n\nWhat chunk sizes have worked well for others? Does it depend on the type of content being indexed?",
      },
      {
        title: "Handling multiple document types in RAG",
        content: "My RAG system needs to handle PDFs, Word docs, and web pages. Each has different structure and formatting.\n\nShould I use different parsing strategies for each, or is there a unified approach that works well across all document types?",
      },
    ],
  },
  {
    title: "Multi-Agent Orchestration",
    slug: "multi-agent-orchestration",
    description: "Design and implement a multi-agent system for complex task automation. Learn about agent communication, task delegation, and coordinating multiple AI agents.",
    difficulty: "hard" as const,
    category: "Advanced",
    discussions: [
      {
        title: "Patterns for agent-to-agent communication",
        content: "I'm designing a multi-agent system where different agents need to share information and coordinate their actions. What patterns have people found effective?\n\nCurrently considering: message passing, shared memory/state, and event-based systems. Each has trade-offs I'm trying to understand better.",
      },
    ],
  },
  {
    title: "Prompt Engineering Fundamentals",
    slug: "prompt-engineering-fundamentals",
    description: "Master the basics of prompt engineering. Learn techniques like few-shot learning, chain-of-thought prompting, and systematic prompt iteration.",
    difficulty: "easy" as const,
    category: "Prompt Engineering",
    discussions: [
      {
        title: "Few-shot vs zero-shot: when to use which?",
        content: "I've been experimenting with few-shot prompting and it definitely improves results for some tasks. But adding examples also increases token count and cost.\n\nAre there guidelines for when few-shot is worth it vs when zero-shot with good instructions is sufficient?",
      },
      {
        title: "Chain-of-thought prompting for code generation",
        content: "Has anyone had success using chain-of-thought (CoT) prompting for code generation tasks? I've seen it work well for math problems, but I'm unsure how to apply it to programming.\n\nShould I ask the model to explain its approach before writing code, or is there a better technique?",
      },
    ],
  },
  {
    title: "Building MCP Servers",
    slug: "building-mcp-servers",
    description: "Create Model Context Protocol servers to extend AI capabilities. Learn the MCP SDK, tool definitions, resource handling, and server deployment.",
    difficulty: "medium" as const,
    category: "MCP Development",
    discussions: [
      {
        title: "MCP server best practices for error handling",
        content: "I'm building my first MCP server and wondering about error handling best practices. When a tool fails, should I return an error response or include the error in the tool result?\n\nAlso, how should I handle rate limiting and timeouts gracefully?",
      },
    ],
  },
  {
    title: "AI-Powered Code Review",
    slug: "ai-code-review",
    description: "Build an automated code review system using AI. Learn to analyze code for bugs, security issues, style problems, and suggest improvements.",
    difficulty: "medium" as const,
    category: "Developer Tools",
    discussions: [
      {
        title: "Reducing false positives in AI code review",
        content: "My AI code review tool flags too many non-issues. Users are starting to ignore warnings because most are false positives.\n\nHow can I tune the prompts or add post-processing to reduce noise while still catching real issues?",
      },
      {
        title: "Integrating AI review with GitHub Actions",
        content: "Looking for advice on integrating AI-powered code review into our GitHub workflow. We want automatic reviews on PRs but need to manage API costs.\n\nShould we review all files or only changed ones? How do you handle large PRs?",
      },
    ],
  },
  {
    title: "Function Calling and Tool Use",
    slug: "function-calling-tool-use",
    description: "Master function calling with LLMs. Learn to define tools, handle function calls, chain tool executions, and build tool-using agents.",
    difficulty: "medium" as const,
    category: "AI Integration",
    discussions: [
      {
        title: "Handling tool execution failures gracefully",
        content: "When a tool call fails (API timeout, invalid parameters, etc.), what's the best way to communicate this back to the model?\n\nShould I retry automatically, ask the model to reformulate the request, or something else?",
      },
    ],
  },
  {
    title: "Building AI Agents from Scratch",
    slug: "building-ai-agents",
    description: "Comprehensive guide to building autonomous AI agents. Cover planning, memory, tool use, error recovery, and agent evaluation.",
    difficulty: "hard" as const,
    category: "AI Agents",
    discussions: [
      {
        title: "Memory systems for long-running agents",
        content: "I'm building an agent that needs to remember context across multiple sessions. Simple conversation history won't scale.\n\nWhat approaches have worked for implementing long-term agent memory? Considering vector stores, knowledge graphs, or hybrid approaches.",
      },
      {
        title: "Agent evaluation: how to measure success?",
        content: "How do you evaluate agent performance systematically? I can test individual tool calls, but measuring end-to-end task completion quality is challenging.\n\nLooking for frameworks or methodologies people use for agent evaluation.",
      },
    ],
  },
];

async function seed() {
  console.log("Seeding practice topics...");

  // Get a user to attribute discussions to (use first user found)
  const existingUsers = await db.select().from(users).limit(1);
  const userId = existingUsers.length > 0 ? existingUsers[0].id : null;

  for (const topicData of sampleTopics) {
    const { discussions: topicDiscussions, ...topicFields } = topicData;

    const topicId = nanoid();

    // Insert topic
    await db.insert(practiceTopics).values({
      id: topicId,
      ...topicFields,
    });

    console.log(`Created topic: ${topicFields.title}`);

    // Insert discussions
    for (const discussionData of topicDiscussions) {
      const discussionId = nanoid();
      await db.insert(discussions).values({
        id: discussionId,
        topicId,
        userId,
        title: discussionData.title,
        content: discussionData.content,
      });
    }

    console.log(`  Added ${topicDiscussions.length} discussions`);
  }

  console.log("\nSeeding complete!");
  console.log(`Created ${sampleTopics.length} topics with discussions.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding practice topics:", error);
  process.exit(1);
});
