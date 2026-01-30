import { db } from "../src/lib/db";
import { projects, nexusWeeklyIssues, users } from "../src/lib/db/schema";
import { nanoid } from "nanoid";

const sampleProjects = [
  {
    title: "AI Code Reviewer",
    description: "An AI-powered code review assistant that provides intelligent feedback on pull requests using GPT-4.",
    content: `# AI Code Reviewer

An intelligent code review assistant built with Next.js and OpenAI's GPT-4.

## Features

- Automatic code analysis on pull requests
- Security vulnerability detection
- Performance suggestions
- Code style recommendations
- Integration with GitHub Actions

## How It Works

1. Connect your GitHub repository
2. Configure review rules
3. Get automatic feedback on every PR

## Technologies Used

- Next.js 14
- OpenAI GPT-4 API
- GitHub API
- Vercel for deployment`,
    repoUrl: "https://github.com/example/ai-code-reviewer",
    demoUrl: "https://ai-code-reviewer.demo.com",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
    status: "featured" as const,
  },
  {
    title: "Prompt Library",
    description: "A curated collection of effective prompts for various AI models, organized by use case and model.",
    content: `# Prompt Library

A comprehensive collection of AI prompts organized by category.

## Categories

- **Coding**: Code generation, debugging, refactoring
- **Writing**: Blog posts, documentation, emails
- **Analysis**: Data analysis, research, summarization
- **Creative**: Storytelling, brainstorming, design

## Features

- Search and filter prompts
- Copy with one click
- Save favorites
- Community contributions`,
    repoUrl: "https://github.com/example/prompt-library",
    demoUrl: "https://prompt-library.demo.com",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
    status: "featured" as const,
  },
  {
    title: "Voice AI Assistant",
    description: "A voice-enabled AI assistant with real-time speech recognition and natural voice synthesis.",
    content: `# Voice AI Assistant

Build conversational AI experiences with voice.

## Features

- Real-time speech recognition
- Natural voice synthesis
- Multi-language support
- Customizable wake words
- Privacy-focused (on-device processing)`,
    repoUrl: "https://github.com/example/voice-ai",
    demoUrl: null,
    coverImage: "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800",
    status: "approved" as const,
  },
  {
    title: "RAG Document Search",
    description: "A retrieval-augmented generation system for intelligent document search and question answering.",
    content: `# RAG Document Search

Search your documents using natural language.

## How It Works

1. Upload your documents (PDF, Word, text)
2. Documents are chunked and embedded
3. Ask questions in natural language
4. Get answers with source citations`,
    repoUrl: "https://github.com/example/rag-search",
    demoUrl: "https://rag-search.demo.com",
    coverImage: "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=800",
    status: "approved" as const,
  },
  {
    title: "AI Chat Widget",
    description: "Embeddable AI chat widget for websites with customizable appearance and behavior.",
    content: `# AI Chat Widget

Add AI-powered chat to any website.

## Features

- Easy embed (single script tag)
- Customizable themes
- Multiple AI backends
- Analytics dashboard`,
    repoUrl: "https://github.com/example/ai-chat-widget",
    demoUrl: null,
    coverImage: null,
    status: "approved" as const,
  },
];

const sampleIssues = [
  {
    issueNumber: 1,
    title: "Welcome to AI Nexus Weekly",
    content: `# Welcome to AI Nexus Weekly!

We're excited to launch the first issue of AI Nexus Weekly, your curated digest of AI news, tutorials, and community highlights.

## What to Expect

Every week, we'll bring you:

- **Top News**: The most important AI developments
- **Tutorials**: Hands-on guides and code examples
- **Community Spotlight**: Featured projects and discussions
- **Tools & Resources**: New tools and helpful resources

## This Week's Highlights

### Claude 3.5 Sonnet Improvements
Anthropic released significant improvements to Claude 3.5 Sonnet, with better coding capabilities and faster response times.

### OpenAI's New Features
OpenAI announced new features for their API, including improved function calling and JSON mode enhancements.

### Community Project: AI Code Reviewer
Check out this amazing community project that automates code reviews using GPT-4!

---

Thanks for reading! See you next week.`,
    status: "published" as const,
    publishedAt: new Date("2025-01-06"),
  },
  {
    issueNumber: 2,
    title: "The Rise of AI Agents",
    content: `# The Rise of AI Agents

This week we dive deep into AI agents - autonomous systems that can perform complex tasks with minimal human intervention.

## What Are AI Agents?

AI agents are systems that can:
- Perceive their environment
- Make decisions
- Take actions to achieve goals
- Learn from experience

## Building Your First Agent

Here's a simple agent architecture:

\`\`\`python
class Agent:
    def __init__(self, tools):
        self.tools = tools
        self.memory = []

    def think(self, task):
        # Use LLM to decide action
        pass

    def act(self, action):
        # Execute the action
        pass
\`\`\`

## Popular Agent Frameworks

1. **LangChain** - Comprehensive framework
2. **AutoGPT** - Autonomous agents
3. **CrewAI** - Multi-agent systems
4. **Claude Computer Use** - Desktop automation

## Community Spotlight

This week's featured project is a multi-agent system for automated research!

---

Happy building!`,
    status: "published" as const,
    publishedAt: new Date("2025-01-13"),
  },
  {
    issueNumber: 3,
    title: "MCP: The New Standard for AI Tools",
    content: `# MCP: The New Standard for AI Tools

Model Context Protocol (MCP) is changing how we build AI tool integrations.

## What is MCP?

MCP is a protocol that allows AI assistants to:
- Access external tools safely
- Read from various data sources
- Perform actions in a sandboxed environment

## Getting Started

Install the MCP SDK:

\`\`\`bash
npm install @modelcontextprotocol/sdk
\`\`\`

Create a simple server:

\`\`\`typescript
import { Server } from '@modelcontextprotocol/sdk/server';

const server = new Server({
  name: 'my-mcp-server',
  version: '1.0.0',
});

server.tool('hello', {
  description: 'Say hello',
}, async () => {
  return { message: 'Hello, world!' };
});

server.start();
\`\`\`

## Best Practices

1. Define clear tool descriptions
2. Handle errors gracefully
3. Implement rate limiting
4. Log tool usage for debugging

---

Start building your MCP servers today!`,
    status: "published" as const,
    publishedAt: new Date("2025-01-20"),
  },
  {
    issueNumber: 4,
    title: "Prompt Engineering Deep Dive",
    content: `# Prompt Engineering Deep Dive

Master the art of crafting effective prompts for AI models.

## Core Techniques

### 1. Be Specific
Instead of: "Write code"
Better: "Write a TypeScript function that validates email addresses"

### 2. Provide Context
Give the model relevant background information.

### 3. Use Examples (Few-Shot)
Show the model what you want with examples.

### 4. Chain of Thought
Ask the model to explain its reasoning.

## Advanced Patterns

- **Role prompting**: "You are an expert..."
- **Output formatting**: "Respond in JSON..."
- **Constraints**: "Keep it under 100 words..."

---

Practice makes perfect!`,
    status: "draft" as const,
    publishedAt: null,
  },
];

async function seed() {
  console.log("Seeding Create section...");

  // Get a user to attribute projects to
  const existingUsers = await db.select().from(users).limit(1);
  const userId = existingUsers.length > 0 ? existingUsers[0].id : null;

  // Seed projects
  console.log("\nSeeding projects...");
  for (const projectData of sampleProjects) {
    await db.insert(projects).values({
      id: nanoid(),
      userId,
      ...projectData,
    });
    console.log(`  Created project: ${projectData.title}`);
  }

  // Seed Nexus Weekly issues
  console.log("\nSeeding Nexus Weekly issues...");
  for (const issueData of sampleIssues) {
    await db.insert(nexusWeeklyIssues).values({
      id: nanoid(),
      ...issueData,
    });
    console.log(`  Created issue #${issueData.issueNumber}: ${issueData.title}`);
  }

  console.log("\nSeeding complete!");
  console.log(`Created ${sampleProjects.length} projects and ${sampleIssues.length} Nexus Weekly issues.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding Create section:", error);
  process.exit(1);
});
