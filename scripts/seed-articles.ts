import { db } from "../src/lib/db";
import { articles, tags, articleTags, users } from "../src/lib/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const sampleArticles = [
  // Articles
  {
    title: "Getting Started with Claude Code: A Complete Guide",
    excerpt: "Learn how to set up and use Claude Code for AI-assisted development with practical examples and best practices.",
    content: `# Getting Started with Claude Code

Claude Code is a powerful AI coding assistant that helps you write, review, and refactor code. This guide will walk you through everything you need to know to get started.

## Installation

First, install Claude Code using npm:

\`\`\`bash
npm install -g @anthropic/claude-code
\`\`\`

Or with Homebrew:

\`\`\`bash
brew install claude-code
\`\`\`

## Configuration

After installation, configure your API key:

\`\`\`bash
claude config set api-key YOUR_API_KEY
\`\`\`

## Basic Usage

### Starting a Session

To start an interactive coding session:

\`\`\`bash
claude
\`\`\`

### Common Commands

- \`/help\` - Show available commands
- \`/clear\` - Clear the conversation
- \`/compact\` - Summarize conversation to save context

## Best Practices

1. **Be specific** - Provide clear context about what you want to achieve
2. **Use examples** - Show sample input/output when possible
3. **Iterate** - Refine your requests based on the responses

## Conclusion

Claude Code is a powerful tool that can significantly boost your productivity. Start with simple tasks and gradually explore more advanced features.`,
    type: "article",
    tags: ["claude", "getting-started", "tutorial", "ai-coding"],
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
  },
  {
    title: "Understanding Prompt Engineering for Code Generation",
    excerpt: "Master the art of writing effective prompts to get better code outputs from AI assistants.",
    content: `# Understanding Prompt Engineering for Code Generation

Prompt engineering is the practice of crafting inputs to AI systems to get optimal outputs. When it comes to code generation, effective prompts can make the difference between generic code and production-ready solutions.

## Key Principles

### 1. Context is King

Always provide relevant context about your project:

\`\`\`
I'm working on a React TypeScript application using Next.js 14.
The project uses TailwindCSS for styling and Zustand for state management.
\`\`\`

### 2. Be Explicit About Requirements

Instead of: "Write a function to process data"

Try: "Write a TypeScript function that:
- Takes an array of user objects with id, name, and email properties
- Filters out users with invalid email formats
- Returns a sorted array by name
- Include JSDoc comments and error handling"

### 3. Provide Examples

Show the AI what you want:

\`\`\`
Input: [{ id: 1, name: "John", value: 10 }]
Expected Output: { "John": 10 }
\`\`\`

## Common Patterns

### The RICE Framework

- **R**ole: Define the AI's expertise
- **I**nstructions: Clear step-by-step guidance
- **C**ontext: Background information
- **E**xamples: Sample inputs and outputs

## Conclusion

Good prompt engineering takes practice. Experiment with different approaches and learn from what works best for your use cases.`,
    type: "article",
    tags: ["prompt-engineering", "ai", "best-practices", "tutorial"],
    coverImage: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=800",
  },
  {
    title: "10 VS Code Extensions Every AI Developer Needs",
    excerpt: "Boost your productivity with these essential VS Code extensions for AI-assisted development.",
    content: `# 10 VS Code Extensions Every AI Developer Needs

The right tools can dramatically improve your development workflow. Here are the must-have VS Code extensions for AI developers.

## 1. GitHub Copilot

The gold standard for AI code completion. Suggests entire functions and handles boilerplate code effortlessly.

## 2. Claude Dev

Official Claude integration for VS Code with inline assistance and code explanation features.

## 3. Error Lens

Highlights errors and warnings inline, making debugging faster when working with AI-generated code.

## 4. GitLens

Essential for understanding code history and tracking AI-assisted changes.

## 5. Prettier

Auto-format code to maintain consistency, especially important when integrating AI suggestions.

## 6. Thunder Client

Test APIs directly in VS Code - perfect for working with AI API integrations.

## 7. REST Client

Send HTTP requests and view responses without leaving the editor.

## 8. Code Spell Checker

Catch typos in comments and strings that AI might introduce.

## 9. Better Comments

Color-code comments for better organization of AI prompts and TODOs.

## 10. Peacock

Color-code your workspaces when working on multiple AI projects.

## Bonus Tips

- Use workspace settings to configure extensions per project
- Create extension packs for quick setup on new machines
- Regularly update extensions for new AI features`,
    type: "article",
    tags: ["vscode", "tools", "productivity", "extensions"],
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
  },

  // News
  {
    title: "Claude 3.5 Sonnet Now Available with Extended Context",
    excerpt: "Anthropic releases Claude 3.5 Sonnet with 200K context window and improved coding capabilities.",
    content: `# Claude 3.5 Sonnet Now Available

Anthropic has announced the release of Claude 3.5 Sonnet, featuring significant improvements in coding capabilities and context handling.

## Key Updates

- **200K Context Window** - Process larger codebases in a single conversation
- **Improved Code Generation** - Better understanding of complex code patterns
- **Faster Response Times** - 2x speed improvement over previous versions
- **Better Tool Use** - More reliable function calling and tool integration

## What This Means for Developers

The extended context window means you can now:

- Analyze entire repositories at once
- Maintain longer coding sessions without losing context
- Work with larger documentation sets

## Availability

Claude 3.5 Sonnet is available now through:
- Anthropic API
- Claude.ai
- Claude Code CLI

Try it today and experience the improved coding capabilities!`,
    type: "news",
    tags: ["claude", "anthropic", "release", "ai-news"],
  },
  {
    title: "GitHub Announces AI-Powered Code Review Features",
    excerpt: "New AI features in GitHub pull requests promise to revolutionize code review workflows.",
    content: `# GitHub Announces AI-Powered Code Review

GitHub has unveiled new AI-powered features for pull request reviews, designed to help teams ship better code faster.

## New Features

### AI Code Suggestions
- Automatic suggestions for code improvements
- Security vulnerability detection
- Performance optimization hints

### Automated Review Comments
- Smart summaries of changes
- Impact analysis
- Test coverage recommendations

### Integration with Copilot
- Seamless workflow between coding and review
- Context-aware suggestions based on project history

## Availability

The new features are rolling out to:
- GitHub Enterprise users (now)
- GitHub Teams (next month)
- Free tier (Q2 2025)

## Developer Reactions

Early adopters report 30% faster review cycles and improved code quality metrics.`,
    type: "news",
    tags: ["github", "code-review", "ai-news", "devtools"],
  },
  {
    title: "OpenAI Codex Sunset: Migration Guide for Developers",
    excerpt: "OpenAI is sunsetting Codex. Here's what you need to know and how to migrate.",
    content: `# OpenAI Codex Sunset: What Developers Need to Know

OpenAI has announced the deprecation of the Codex API. Here's everything you need to know about migrating your applications.

## Timeline

- **March 2025**: Codex API deprecated
- **June 2025**: Read-only access
- **September 2025**: Complete shutdown

## Migration Options

### Option 1: GPT-4 Turbo
- Best for complex code generation
- Higher cost but better quality
- Supports function calling

### Option 2: Claude
- Competitive pricing
- Excellent code understanding
- 200K context window

### Option 3: Open Source Models
- Code Llama
- StarCoder
- Self-hosted options

## Migration Steps

1. Audit your current Codex usage
2. Evaluate alternative providers
3. Update API calls and prompts
4. Test thoroughly before switching
5. Monitor performance post-migration

## Resources

- [Official Migration Guide](https://openai.com/codex-migration)
- [Community Discussion](https://community.openai.com)
- [Code Samples](https://github.com/openai/codex-migration)`,
    type: "news",
    tags: ["openai", "codex", "migration", "ai-news"],
  },

  // Videos
  {
    title: "Building a Full-Stack App with Claude Code in 30 Minutes",
    excerpt: "Watch how to build a complete web application from scratch using AI-assisted development.",
    content: `# Building a Full-Stack App with Claude Code

In this video tutorial, we'll build a complete full-stack application using Claude Code for AI-assisted development.

## What We'll Build

A task management application with:
- User authentication
- CRUD operations
- Real-time updates
- Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Prisma + PostgreSQL
- TailwindCSS
- Auth.js

## Topics Covered

1. Project setup and configuration
2. Database schema design with AI assistance
3. API route generation
4. Frontend component creation
5. Styling with Tailwind
6. Deployment to Vercel

## Key Takeaways

- How to effectively prompt Claude for code generation
- Best practices for reviewing AI-generated code
- Tips for faster iteration cycles

Watch the full tutorial to see Claude Code in action!`,
    type: "video",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tags: ["tutorial", "full-stack", "nextjs", "claude"],
  },
  {
    title: "AI Pair Programming: Tips from Senior Engineers",
    excerpt: "Senior developers share their strategies for effective AI-assisted coding workflows.",
    content: `# AI Pair Programming: Tips from Senior Engineers

Join us for an insightful discussion with senior engineers from top tech companies about their AI coding workflows.

## Panelists

- Sarah Chen - Staff Engineer at Stripe
- Marcus Johnson - Principal Engineer at Vercel
- Elena Rodriguez - Tech Lead at Anthropic

## Discussion Topics

### When to Use AI
- Boilerplate code generation
- Test writing
- Documentation
- Code review assistance

### When NOT to Use AI
- Security-critical code
- Complex business logic
- Performance-sensitive algorithms

### Best Practices

1. Always review generated code thoroughly
2. Use AI as a starting point, not the final answer
3. Maintain your own understanding of the codebase
4. Document AI-assisted changes appropriately

## Q&A Highlights

The panelists answer common questions about AI coding tools and share their predictions for the future of software development.`,
    type: "video",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tags: ["pair-programming", "senior-engineers", "best-practices", "discussion"],
  },
  {
    title: "Deep Dive: How LLMs Understand Code",
    excerpt: "A technical exploration of how large language models process and generate code.",
    content: `# Deep Dive: How LLMs Understand Code

This technical deep dive explores the mechanisms behind code understanding in large language models.

## Topics Covered

### Tokenization
- How code is broken into tokens
- Handling different programming languages
- Special tokens for code structures

### Attention Mechanisms
- How models track variable references
- Understanding scope and context
- Cross-file dependencies

### Training Data
- Sources of code training data
- Deduplication and filtering
- License considerations

### Inference
- Beam search vs sampling
- Temperature and code quality
- Context window utilization

## Practical Implications

Understanding these mechanisms helps you:
- Write better prompts
- Understand model limitations
- Debug unexpected outputs
- Choose the right model for your task

Perfect for developers who want to go beyond surface-level usage!`,
    type: "video",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tags: ["llm", "technical", "deep-dive", "machine-learning"],
  },

  // Livestreams
  {
    title: "Live Coding: Building an AI Agent from Scratch",
    excerpt: "Join us for a live coding session where we build an AI agent using the Claude API.",
    content: `# Live Coding: Building an AI Agent

Join us for an interactive live coding session where we'll build a fully functional AI agent from scratch.

## What We'll Build

An autonomous coding agent that can:
- Read and understand code files
- Make targeted edits
- Run tests and fix issues
- Commit changes to git

## Schedule

- **Introduction** (15 min): Overview and setup
- **Core Agent Loop** (45 min): Building the main logic
- **Tool Integration** (30 min): Adding file and git tools
- **Testing & Demo** (20 min): Running the agent
- **Q&A** (20 min): Your questions answered

## Prerequisites

- Basic understanding of Python or TypeScript
- Familiarity with the Claude API
- Have your development environment ready

## Join Us

The stream will be interactive - bring your questions and suggestions!

Can't make it live? The recording will be available on our YouTube channel.`,
    type: "livestream",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tags: ["livestream", "ai-agent", "coding", "interactive"],
  },
  {
    title: "Office Hours: Ask Me Anything About AI Development",
    excerpt: "Monthly AMA session covering AI development questions from the community.",
    content: `# Office Hours: Ask Me Anything

Join our monthly AMA session where we answer your questions about AI development, tools, and best practices.

## This Month's Topics

Based on community submissions, we'll focus on:

1. **Choosing the Right AI Model**
   - When to use Claude vs GPT vs open source
   - Cost optimization strategies
   - Performance benchmarks

2. **Production Deployment**
   - Rate limiting and quotas
   - Error handling
   - Monitoring and observability

3. **Security Considerations**
   - Prompt injection prevention
   - Data privacy
   - Access control

## How to Participate

- Submit questions in advance via Discord
- Join live to ask follow-up questions
- Vote on questions you want answered

## Resources

We'll share links and resources for all topics discussed.

See you there!`,
    type: "livestream",
    tags: ["ama", "office-hours", "community", "q-and-a"],
  },
];

async function seed() {
  console.log("Seeding articles...");

  // Get or create system user
  const systemUserId = "system-lyceum";

  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, systemUserId),
  });

  if (!existingUser) {
    await db.insert(users).values({
      id: systemUserId,
      email: "system@lyceum.ai",
      name: "AI Lyceum",
      role: "admin",
    });
    console.log("Created system user");
  }

  for (const article of sampleArticles) {
    const slug = generateSlug(article.title);

    // Check if article exists
    const existing = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
    });

    if (existing) {
      console.log(`Skipping ${article.title} (already exists)`);
      continue;
    }

    const articleId = nanoid();
    const now = new Date();

    // Insert article
    await db.insert(articles).values({
      id: articleId,
      title: article.title,
      slug,
      excerpt: article.excerpt,
      content: article.content,
      coverImage: article.coverImage || null,
      type: article.type as "article" | "news" | "video" | "livestream",
      videoUrl: article.videoUrl || null,
      authorId: systemUserId,
      status: "published",
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Handle tags
    for (const tagName of article.tags) {
      const tagSlug = generateSlug(tagName);

      let tag = await db.query.tags.findFirst({
        where: eq(tags.slug, tagSlug),
      });

      if (!tag) {
        const newTag = await db
          .insert(tags)
          .values({
            id: nanoid(),
            name: tagName,
            slug: tagSlug,
          })
          .returning();
        tag = newTag[0];
      }

      await db.insert(articleTags).values({
        articleId,
        tagId: tag.id,
      });
    }

    console.log(`Created: ${article.title}`);
  }

  console.log("\nSeeding complete!");
}

seed().catch(console.error);
