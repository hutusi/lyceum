import { db } from "../src/lib/db";
import { courses, lessons } from "../src/lib/db/schema";
import { nanoid } from "nanoid";

const sampleCourses = [
  {
    title: "Introduction to AI Coding with Claude",
    slug: "intro-ai-coding-claude",
    description: "Learn the fundamentals of AI-assisted coding using Claude. This course covers prompt engineering basics, code generation, and best practices for working with AI coding assistants.",
    category: "course" as const,
    difficulty: "beginner" as const,
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
    status: "published" as const,
    lessons: [
      {
        title: "What is AI-Assisted Coding?",
        content: "# What is AI-Assisted Coding?\n\nAI-assisted coding represents a paradigm shift in software development. Instead of writing every line of code manually, developers can now collaborate with AI systems to:\n\n- Generate boilerplate code\n- Debug existing code\n- Refactor and optimize\n- Learn new technologies faster\n\n## Why It Matters\n\nAI coding assistants can significantly boost productivity while helping developers focus on higher-level problem solving.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 15,
      },
      {
        title: "Setting Up Your Environment",
        content: "# Setting Up Your Environment\n\nBefore we start coding with AI, let's set up our development environment.\n\n## Prerequisites\n\n1. A modern code editor (VS Code recommended)\n2. Node.js 18+ installed\n3. Access to Claude or another AI assistant\n\n## Installing Claude Code CLI\n\n```bash\nnpm install -g @anthropic-ai/claude-code\n```\n\n## Configuration\n\nCreate a `.claude` directory in your project root and add your configuration.",
        videoUrl: null,
        duration: 20,
      },
      {
        title: "Your First AI-Generated Code",
        content: "# Your First AI-Generated Code\n\nLet's write our first piece of code with AI assistance.\n\n## The Prompt\n\nA good prompt is clear, specific, and provides context. For example:\n\n> Write a TypeScript function that validates an email address and returns true if valid, false otherwise.\n\n## Understanding the Output\n\nAI will generate code, but you should always:\n\n1. Review the logic\n2. Test edge cases\n3. Understand how it works\n\n## Practice Exercise\n\nTry generating a function that calculates the factorial of a number.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 25,
      },
    ],
  },
  {
    title: "Advanced Prompt Engineering",
    slug: "advanced-prompt-engineering",
    description: "Master the art of crafting effective prompts for AI systems. Learn techniques like few-shot learning, chain-of-thought prompting, and how to get consistent, high-quality outputs.",
    category: "prompt-engineering" as const,
    difficulty: "intermediate" as const,
    coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800",
    status: "published" as const,
    lessons: [
      {
        title: "The Anatomy of a Good Prompt",
        content: "# The Anatomy of a Good Prompt\n\nEffective prompts share common characteristics that lead to better AI outputs.\n\n## Key Components\n\n1. **Context**: Background information the AI needs\n2. **Task**: What you want the AI to do\n3. **Format**: How you want the output structured\n4. **Constraints**: Limitations or requirements\n\n## Example\n\n```\nContext: I'm building a Next.js e-commerce site.\nTask: Generate a product card component.\nFormat: TypeScript with Tailwind CSS.\nConstraints: Must be accessible and responsive.\n```",
        videoUrl: null,
        duration: 30,
      },
      {
        title: "Few-Shot Learning Techniques",
        content: "# Few-Shot Learning Techniques\n\nFew-shot learning provides examples to guide the AI's output.\n\n## How It Works\n\nInstead of just describing what you want, you show examples:\n\n```\nConvert these sentences to formal English:\n\nInput: gonna grab some food\nOutput: I am going to get some food.\n\nInput: wanna come with?\nOutput: Would you like to come with me?\n\nInput: that's cool\nOutput: \n```\n\n## When to Use Few-Shot\n\n- When you need consistent formatting\n- When the task is ambiguous\n- When you want a specific style",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 35,
      },
      {
        title: "Chain-of-Thought Prompting",
        content: "# Chain-of-Thought Prompting\n\nChain-of-thought prompting asks the AI to show its reasoning step by step.\n\n## The Technique\n\nAdd phrases like:\n- \"Let's think step by step\"\n- \"Show your reasoning\"\n- \"Explain your thought process\"\n\n## Benefits\n\n1. More accurate results for complex problems\n2. Easier to spot errors in logic\n3. Better understanding of the solution\n\n## Example\n\n```\nSolve this programming problem step by step:\nGiven an array of integers, find two numbers that add up to a target sum.\n```",
        videoUrl: null,
        duration: 40,
      },
      {
        title: "Handling Edge Cases",
        content: "# Handling Edge Cases in Prompts\n\nGood prompts anticipate and handle edge cases.\n\n## Common Issues\n\n- Empty inputs\n- Invalid data types\n- Boundary conditions\n- Error handling\n\n## Prompt Enhancement\n\nBefore:\n> Write a function to divide two numbers.\n\nAfter:\n> Write a function to divide two numbers. Handle division by zero gracefully by returning null. Include input validation for non-numeric values.\n\n## Practice\n\nRewrite these prompts to handle edge cases:\n1. \"Parse a JSON string\"\n2. \"Find the maximum value in an array\"",
        videoUrl: null,
        duration: 25,
      },
    ],
  },
  {
    title: "Building Web Apps with AI Assistance",
    slug: "web-apps-ai-assistance",
    description: "Learn to build modern web applications using AI coding assistants. Cover React, Next.js, and full-stack development with AI-powered workflows.",
    category: "course" as const,
    difficulty: "intermediate" as const,
    coverImage: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800",
    status: "published" as const,
    lessons: [
      {
        title: "Planning Your App with AI",
        content: "# Planning Your App with AI\n\nBefore writing code, use AI to help plan your application architecture.\n\n## Key Questions to Ask\n\n1. What are the main features?\n2. What tech stack should I use?\n3. How should I structure the database?\n4. What are potential challenges?\n\n## Example Prompt\n\n```\nI want to build a task management app with:\n- User authentication\n- Team collaboration\n- Real-time updates\n\nSuggest a tech stack and basic architecture.\n```",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 20,
      },
      {
        title: "Generating React Components",
        content: "# Generating React Components\n\nAI excels at generating boilerplate React components.\n\n## Best Practices\n\n1. Specify the component type (functional/class)\n2. Mention state management needs\n3. Include styling preferences\n4. Define props interface\n\n## Example\n\n```typescript\n// Prompt: Create a reusable Button component with variants\n\ninterface ButtonProps {\n  variant: 'primary' | 'secondary' | 'danger';\n  size: 'sm' | 'md' | 'lg';\n  children: React.ReactNode;\n  onClick?: () => void;\n}\n```",
        videoUrl: null,
        duration: 30,
      },
      {
        title: "API Development with AI",
        content: "# API Development with AI\n\nLet AI help you build robust APIs faster.\n\n## Generating Endpoints\n\nProvide context about your data model:\n\n```\nI have a User model with: id, email, name, createdAt.\nGenerate CRUD API endpoints using Next.js App Router.\nInclude validation and error handling.\n```\n\n## Database Queries\n\nAI can help optimize database queries:\n\n```\nOptimize this Prisma query for fetching users with their posts,\nincluding pagination and sorting by creation date.\n```",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 35,
      },
    ],
  },
  {
    title: "AI for Code Review and Debugging",
    slug: "ai-code-review-debugging",
    description: "Use AI to improve your code quality through automated reviews and intelligent debugging. Learn to identify bugs, security issues, and performance problems.",
    category: "course" as const,
    difficulty: "intermediate" as const,
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
    status: "published" as const,
    lessons: [
      {
        title: "AI-Powered Code Review",
        content: "# AI-Powered Code Review\n\nUse AI to catch issues before they reach production.\n\n## What AI Can Review\n\n- Code style and consistency\n- Potential bugs\n- Security vulnerabilities\n- Performance issues\n- Best practice violations\n\n## Effective Review Prompts\n\n```\nReview this code for:\n1. Security vulnerabilities\n2. Performance issues\n3. Error handling gaps\n4. Code style improvements\n\n[paste your code]\n```",
        videoUrl: null,
        duration: 25,
      },
      {
        title: "Debugging with AI",
        content: "# Debugging with AI\n\nAI can help identify and fix bugs faster.\n\n## Debugging Workflow\n\n1. Describe the expected behavior\n2. Describe the actual behavior\n3. Share relevant code\n4. Include error messages\n\n## Example Debug Prompt\n\n```\nExpected: User should be redirected after login\nActual: Page shows blank screen\n\nError: \"Cannot read property 'user' of undefined\"\n\n[paste relevant code]\n\nWhat's causing this issue?\n```",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 30,
      },
      {
        title: "Security Analysis with AI",
        content: "# Security Analysis with AI\n\nProtect your applications by using AI to identify vulnerabilities.\n\n## Common Security Issues\n\n- SQL Injection\n- XSS (Cross-Site Scripting)\n- CSRF (Cross-Site Request Forgery)\n- Insecure authentication\n- Data exposure\n\n## Security Review Prompt\n\n```\nAnalyze this authentication code for security vulnerabilities:\n\n[paste code]\n\nCheck for:\n- Password handling issues\n- Session management problems\n- Input validation gaps\n```",
        videoUrl: null,
        duration: 35,
      },
    ],
  },
  {
    title: "MCP Servers Development",
    slug: "mcp-servers-development",
    description: "Learn to build Model Context Protocol (MCP) servers that extend AI capabilities. Create custom tools and integrations for Claude and other AI assistants.",
    category: "workshop" as const,
    difficulty: "advanced" as const,
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
    status: "published" as const,
    lessons: [
      {
        title: "Introduction to MCP",
        content: "# Introduction to MCP\n\nModel Context Protocol (MCP) allows you to extend AI capabilities with custom tools.\n\n## What is MCP?\n\nMCP is a protocol that enables:\n- Custom tool creation\n- External service integration\n- Resource access for AI\n- Secure sandboxed execution\n\n## Use Cases\n\n1. Database access tools\n2. API integrations\n3. File system operations\n4. Custom business logic",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 20,
      },
      {
        title: "Building Your First MCP Server",
        content: "# Building Your First MCP Server\n\nLet's create a simple MCP server.\n\n## Project Setup\n\n```bash\nmkdir my-mcp-server\ncd my-mcp-server\nnpm init -y\nnpm install @modelcontextprotocol/sdk\n```\n\n## Basic Server Structure\n\n```typescript\nimport { Server } from '@modelcontextprotocol/sdk/server';\n\nconst server = new Server({\n  name: 'my-mcp-server',\n  version: '1.0.0',\n});\n\n// Define tools here\n\nserver.start();\n```",
        videoUrl: null,
        duration: 40,
      },
      {
        title: "Creating Custom Tools",
        content: "# Creating Custom Tools\n\nTools are the core feature of MCP servers.\n\n## Tool Definition\n\n```typescript\nserver.tool('calculate', {\n  description: 'Perform a calculation',\n  parameters: {\n    type: 'object',\n    properties: {\n      expression: { type: 'string' }\n    },\n    required: ['expression']\n  }\n}, async ({ expression }) => {\n  const result = eval(expression);\n  return { result };\n});\n```\n\n## Best Practices\n\n1. Clear descriptions\n2. Input validation\n3. Error handling\n4. Rate limiting",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 45,
      },
      {
        title: "Deploying MCP Servers",
        content: "# Deploying MCP Servers\n\nMake your MCP server available to users.\n\n## Deployment Options\n\n1. **Local**: Run on user's machine\n2. **Docker**: Containerized deployment\n3. **Cloud**: Hosted service\n\n## Configuration\n\nUsers configure MCP servers in their AI client:\n\n```json\n{\n  \"mcpServers\": {\n    \"my-server\": {\n      \"command\": \"node\",\n      \"args\": [\"path/to/server.js\"]\n    }\n  }\n}\n```\n\n## Publishing\n\nShare your MCP server via npm or GitHub.",
        videoUrl: null,
        duration: 30,
      },
    ],
  },
  {
    title: "AI Agent Development",
    slug: "ai-agent-development",
    description: "Build autonomous AI agents that can perform complex tasks. Learn about agent architectures, tool use, memory systems, and orchestration patterns.",
    category: "workshop" as const,
    difficulty: "advanced" as const,
    coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    status: "published" as const,
    lessons: [
      {
        title: "What Are AI Agents?",
        content: "# What Are AI Agents?\n\nAI agents are autonomous systems that can perform tasks with minimal human intervention.\n\n## Key Characteristics\n\n1. **Autonomy**: Can make decisions\n2. **Tool Use**: Can interact with external systems\n3. **Memory**: Can remember context\n4. **Planning**: Can break down complex tasks\n\n## Agent vs Chatbot\n\n| Feature | Chatbot | Agent |\n|---------|---------|-------|\n| Autonomy | Low | High |\n| Tool Use | Limited | Extensive |\n| Task Complexity | Simple | Complex |",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 25,
      },
      {
        title: "Agent Architecture Patterns",
        content: "# Agent Architecture Patterns\n\nDifferent architectures for different use cases.\n\n## ReAct Pattern\n\nReasoning + Acting in an interleaved manner:\n\n1. Observe the current state\n2. Think about what to do\n3. Take an action\n4. Observe the result\n5. Repeat\n\n## Multi-Agent Systems\n\nSpecialized agents working together:\n\n- Researcher Agent\n- Coder Agent\n- Reviewer Agent\n- Coordinator Agent",
        videoUrl: null,
        duration: 35,
      },
      {
        title: "Building a Task Agent",
        content: "# Building a Task Agent\n\nCreate an agent that can complete multi-step tasks.\n\n## Core Components\n\n```typescript\nclass TaskAgent {\n  private llm: LanguageModel;\n  private tools: Tool[];\n  private memory: Memory;\n\n  async execute(task: string): Promise<Result> {\n    const plan = await this.createPlan(task);\n    \n    for (const step of plan) {\n      const result = await this.executeStep(step);\n      this.memory.add(result);\n    }\n    \n    return this.summarize();\n  }\n}\n```\n\n## Error Recovery\n\nAgents should handle failures gracefully.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 45,
      },
    ],
  },
];

async function seed() {
  console.log("Seeding courses...");

  for (const courseData of sampleCourses) {
    const { lessons: lessonData, ...courseFields } = courseData;

    const courseId = nanoid();

    // Insert course
    await db.insert(courses).values({
      id: courseId,
      ...courseFields,
    });

    console.log(`Created course: ${courseFields.title}`);

    // Insert lessons
    for (let i = 0; i < lessonData.length; i++) {
      const lesson = lessonData[i];
      await db.insert(lessons).values({
        id: nanoid(),
        courseId,
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        order: i + 1,
      });
    }

    console.log(`  Added ${lessonData.length} lessons`);
  }

  console.log("\nSeeding complete!");
  console.log(`Created ${sampleCourses.length} courses with lessons.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding courses:", error);
  process.exit(1);
});
