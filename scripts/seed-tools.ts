import { db } from "../src/lib/db";
import { sharedTools, toolTags, sharedToolTags, toolVersions, users } from "../src/lib/db/schema";
import { nanoid } from "nanoid";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const sampleTools = [
  // Skills
  {
    name: "Code Review Agent",
    description: "An intelligent sub-agent that reviews your code for bugs, security issues, and best practices. Provides actionable feedback with suggested fixes.",
    readme: `# Code Review Agent

A comprehensive code review assistant that helps identify issues in your codebase.

## Features
- Security vulnerability detection
- Performance optimization suggestions
- Code style and best practices
- Complexity analysis
- Test coverage recommendations

## Usage
\`\`\`
claude agent invoke code-review --files="src/**/*.ts"
\`\`\`

## Configuration
Set your preferred review depth in the config:
- \`shallow\`: Quick scan for obvious issues
- \`standard\`: Balanced review (default)
- \`deep\`: Thorough analysis with suggestions`,
    type: "agent",
    tags: ["code-review", "quality", "security", "best-practices"],
    stars: 256,
    downloads: 3542,
  },
  {
    name: "Git Workflow Skill",
    description: "Streamlines complex git workflows including branching strategies, rebasing, conflict resolution, and commit message formatting.",
    readme: `# Git Workflow Skill

Master your git workflow with intelligent automation.

## Features
- Smart branching (feature, hotfix, release)
- Interactive rebase assistance
- Conflict resolution guidance
- Conventional commit formatting
- PR description generation

## Commands
- \`git-flow start feature <name>\`
- \`git-flow finish\`
- \`git-flow resolve-conflicts\``,
    type: "skill",
    tags: ["git", "workflow", "productivity", "version-control"],
    stars: 189,
    downloads: 2987,
  },
  {
    name: "Database MCP",
    description: "Model Context Protocol for connecting to PostgreSQL, MySQL, SQLite, and MongoDB with intelligent query generation and schema exploration.",
    readme: `# Database MCP

Connect your AI agent to databases with smart context awareness.

## Supported Databases
- PostgreSQL
- MySQL / MariaDB
- SQLite
- MongoDB

## Features
- Auto-discover schema
- Natural language to SQL
- Safe query execution
- Result formatting
- Migration assistance

## Configuration
\`\`\`json
{
  "type": "postgres",
  "host": "localhost",
  "database": "myapp"
}
\`\`\``,
    type: "mcp",
    tags: ["database", "sql", "postgresql", "mysql", "mongodb"],
    stars: 412,
    downloads: 5201,
  },
  {
    name: "Test Generator",
    description: "Automatically generates comprehensive unit tests with high coverage, edge case detection, and mocking strategies.",
    readme: `# Test Generator

Generate high-quality tests for your codebase automatically.

## Supported Frameworks
- Jest / Vitest
- Pytest
- Go testing
- JUnit

## Features
- Edge case detection
- Mock generation
- Coverage optimization
- Parameterized tests
- Snapshot testing

## Usage
\`\`\`
claude skill test-gen --file="src/utils.ts" --framework="vitest"
\`\`\``,
    type: "skill",
    tags: ["testing", "automation", "jest", "vitest", "coverage"],
    stars: 298,
    downloads: 4105,
  },
  {
    name: "Documentation Agent",
    description: "Generates and maintains code documentation, README files, API docs, and inline comments based on your codebase.",
    readme: `# Documentation Agent

Keep your documentation in sync with your code.

## Features
- README generation
- API documentation (OpenAPI/Swagger)
- JSDoc / TSDoc comments
- Changelog generation
- Architecture diagrams (Mermaid)

## Commands
- \`doc-agent readme\`
- \`doc-agent api --format=openapi\`
- \`doc-agent comments --file=src/\``,
    type: "agent",
    tags: ["documentation", "readme", "api-docs", "jsdoc"],
    stars: 167,
    downloads: 2123,
  },
  {
    name: "API Integration MCP",
    description: "Seamless integration with REST, GraphQL, and gRPC APIs. Auto-generates types and handles authentication.",
    readme: `# API Integration MCP

Connect to any API with intelligent type inference.

## Protocols
- REST (OpenAPI/Swagger)
- GraphQL
- gRPC
- WebSocket

## Features
- Type generation from schemas
- OAuth / API key management
- Request/response caching
- Rate limiting
- Retry with backoff

## Configuration
\`\`\`json
{
  "baseUrl": "https://api.example.com",
  "auth": {
    "type": "bearer",
    "token": "$API_TOKEN"
  }
}
\`\`\``,
    type: "mcp",
    tags: ["api", "rest", "graphql", "integration"],
    stars: 334,
    downloads: 4890,
  },
  {
    name: "Refactoring Skill",
    description: "Intelligent code refactoring with pattern detection, extract method, rename symbol, and architectural improvements.",
    readme: `# Refactoring Skill

Modernize and improve your codebase safely.

## Refactoring Operations
- Extract method/function
- Rename symbol
- Move to file
- Inline variable
- Convert to async/await
- Decompose conditionals

## Safety
- Preserves behavior
- Updates all references
- Generates tests for changes

## Usage
\`\`\`
claude skill refactor --operation="extract-method" --selection="lines:10-25"
\`\`\``,
    type: "skill",
    tags: ["refactoring", "code-quality", "clean-code"],
    stars: 223,
    downloads: 3456,
  },
  {
    name: "Security Scanner Agent",
    description: "Scans your codebase for security vulnerabilities, outdated dependencies, secrets, and OWASP Top 10 issues.",
    readme: `# Security Scanner Agent

Proactive security analysis for your projects.

## Checks
- OWASP Top 10 vulnerabilities
- Dependency vulnerabilities (CVEs)
- Hardcoded secrets/credentials
- SQL injection risks
- XSS vulnerabilities
- Insecure configurations

## Output
- Severity-ranked findings
- Remediation guidance
- SARIF format for CI integration

## Usage
\`\`\`
claude agent security-scan --path="." --severity="high,critical"
\`\`\``,
    type: "agent",
    tags: ["security", "owasp", "vulnerability", "scanning"],
    stars: 445,
    downloads: 6234,
  },
  {
    name: "Docker MCP",
    description: "Manage Docker containers, images, and compose files. Generate Dockerfiles and optimize builds.",
    readme: `# Docker MCP

Full Docker integration for your development workflow.

## Features
- Container management
- Image building
- Compose orchestration
- Dockerfile generation
- Multi-stage build optimization
- Layer caching analysis

## Commands
- Build and run containers
- Inspect logs and stats
- Generate optimized Dockerfiles
- Debug container issues

## Configuration
\`\`\`json
{
  "socket": "/var/run/docker.sock",
  "defaultRegistry": "ghcr.io"
}
\`\`\``,
    type: "mcp",
    tags: ["docker", "containers", "devops", "dockerfile"],
    stars: 378,
    downloads: 5567,
  },
  {
    name: "TypeScript Wizard",
    description: "Advanced TypeScript assistance including type inference, generic helpers, and migration from JavaScript.",
    readme: `# TypeScript Wizard

Master TypeScript with intelligent assistance.

## Features
- JS to TS migration
- Type inference and generation
- Generic type helpers
- Strict mode fixes
- Declaration file generation

## Commands
\`\`\`
claude skill ts-wizard migrate --file="src/legacy.js"
claude skill ts-wizard infer-types --file="src/api.ts"
claude skill ts-wizard strict --fix
\`\`\``,
    type: "skill",
    tags: ["typescript", "types", "migration", "javascript"],
    stars: 287,
    downloads: 4123,
  },
  {
    name: "Performance Profiler Agent",
    description: "Analyzes code performance, identifies bottlenecks, and suggests optimizations with benchmarking.",
    readme: `# Performance Profiler Agent

Optimize your application performance.

## Analysis
- CPU profiling
- Memory leak detection
- Bundle size analysis
- Database query optimization
- API response times

## Features
- Flamegraph generation
- Benchmark comparisons
- Optimization suggestions
- Before/after metrics

## Usage
\`\`\`
claude agent perf-profile --entry="src/index.ts" --duration=30s
\`\`\``,
    type: "agent",
    tags: ["performance", "profiling", "optimization", "benchmarking"],
    stars: 234,
    downloads: 3234,
  },
  {
    name: "GitHub MCP",
    description: "Full GitHub integration - issues, PRs, actions, releases, and repository management from your agent.",
    readme: `# GitHub MCP

Complete GitHub integration for your AI workflow.

## Features
- Issue management
- Pull request operations
- GitHub Actions control
- Release automation
- Repository settings
- Code search

## Capabilities
- Create/update issues and PRs
- Review and merge PRs
- Trigger/cancel workflows
- Create releases with changelogs
- Manage labels and milestones

## Configuration
\`\`\`json
{
  "token": "$GITHUB_TOKEN",
  "defaultOrg": "your-org"
}
\`\`\``,
    type: "mcp",
    tags: ["github", "git", "ci-cd", "automation"],
    stars: 512,
    downloads: 7890,
  },
  {
    name: "Regex Builder",
    description: "Build, test, and explain regular expressions with natural language input and visual debugging.",
    readme: `# Regex Builder

Make regex easy with AI assistance.

## Features
- Natural language to regex
- Visual regex debugging
- Match highlighting
- Performance analysis
- Common pattern library

## Examples
\`\`\`
"Match email addresses" → /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/
"Extract URLs from text" → /https?:\\/\\/[^\\s]+/g
\`\`\`

## Usage
\`\`\`
claude skill regex "match phone numbers with optional country code"
\`\`\``,
    type: "skill",
    tags: ["regex", "pattern-matching", "text-processing"],
    stars: 156,
    downloads: 2345,
  },
  {
    name: "Kubernetes MCP",
    description: "Manage Kubernetes clusters, deployments, and resources. Generate manifests and troubleshoot issues.",
    readme: `# Kubernetes MCP

Kubernetes management made simple.

## Features
- Cluster management
- Deployment operations
- Pod inspection/debugging
- Manifest generation
- Helm chart support
- Resource monitoring

## Operations
- Deploy applications
- Scale deployments
- View logs and events
- Debug pod issues
- Generate YAML manifests

## Configuration
\`\`\`json
{
  "context": "my-cluster",
  "namespace": "default"
}
\`\`\``,
    type: "mcp",
    tags: ["kubernetes", "k8s", "devops", "containers"],
    stars: 389,
    downloads: 4567,
  },
  {
    name: "Code Translator",
    description: "Translate code between programming languages while preserving logic, idioms, and best practices.",
    readme: `# Code Translator

Seamlessly translate code between languages.

## Supported Languages
- JavaScript ↔ TypeScript
- Python ↔ JavaScript
- Go ↔ Rust
- Java ↔ Kotlin
- And many more...

## Features
- Idiomatic translations
- Preserves comments
- Handles dependencies
- Test translation

## Usage
\`\`\`
claude skill translate --from=python --to=javascript --file="script.py"
\`\`\``,
    type: "skill",
    tags: ["translation", "languages", "conversion", "migration"],
    stars: 198,
    downloads: 2890,
  },
  {
    name: "CI/CD Pipeline Agent",
    description: "Generates and optimizes CI/CD pipelines for GitHub Actions, GitLab CI, CircleCI, and Jenkins.",
    readme: `# CI/CD Pipeline Agent

Automate your deployment pipeline.

## Platforms
- GitHub Actions
- GitLab CI
- CircleCI
- Jenkins
- Azure Pipelines

## Features
- Pipeline generation
- Optimization suggestions
- Secret management
- Caching strategies
- Matrix builds

## Usage
\`\`\`
claude agent ci-pipeline --platform=github-actions --detect
\`\`\``,
    type: "agent",
    tags: ["ci-cd", "github-actions", "devops", "automation"],
    stars: 267,
    downloads: 3789,
  },
  {
    name: "AWS MCP",
    description: "Interact with AWS services - S3, Lambda, EC2, DynamoDB, and more with intelligent suggestions.",
    readme: `# AWS MCP

Full AWS integration for your AI agent.

## Supported Services
- S3 (storage)
- Lambda (functions)
- EC2 (compute)
- DynamoDB (database)
- CloudWatch (monitoring)
- IAM (security)

## Features
- Resource management
- Log analysis
- Cost optimization
- Infrastructure as Code
- Security recommendations

## Configuration
\`\`\`json
{
  "region": "us-east-1",
  "profile": "default"
}
\`\`\``,
    type: "mcp",
    tags: ["aws", "cloud", "s3", "lambda", "infrastructure"],
    stars: 423,
    downloads: 5678,
  },
  {
    name: "Error Explainer",
    description: "Analyzes error messages, stack traces, and logs to provide clear explanations and fixes.",
    readme: `# Error Explainer

Never be confused by error messages again.

## Features
- Stack trace analysis
- Error message translation
- Root cause identification
- Fix suggestions
- Similar issues search

## Supported
- JavaScript/TypeScript errors
- Python tracebacks
- Java exceptions
- Go panics
- Rust panics
- Build errors

## Usage
Just paste your error and get an explanation!`,
    type: "skill",
    tags: ["debugging", "errors", "troubleshooting", "stack-trace"],
    stars: 312,
    downloads: 4567,
  },
];

async function seed() {
  console.log("Seeding tools...");

  // Create a system user for sample tools
  const systemUserId = "system-lyceum";

  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, systemUserId),
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

  for (const tool of sampleTools) {
    const slug = generateSlug(tool.name);
    const toolId = nanoid();

    // Check if tool already exists
    const existing = await db.query.sharedTools.findFirst({
      where: (sharedTools, { eq }) => eq(sharedTools.slug, slug),
    });

    if (existing) {
      console.log(`Skipping ${tool.name} (already exists)`);
      continue;
    }

    // Insert tool
    await db.insert(sharedTools).values({
      id: toolId,
      userId: systemUserId,
      name: tool.name,
      slug,
      description: tool.description,
      readme: tool.readme,
      type: tool.type as "skill" | "agent" | "mcp",
      version: "1.0.0",
      installCommand: `claude ${tool.type} add lyceum/${slug}`,
      downloads: tool.downloads,
      stars: tool.stars,
      status: "approved",
      publishedAt: new Date(),
    });

    // Create version
    await db.insert(toolVersions).values({
      id: nanoid(),
      toolId,
      version: "1.0.0",
      changelog: "Initial release",
      installCommand: `claude ${tool.type} add lyceum/${slug}`,
      isLatest: true,
    });

    // Handle tags
    for (const tagName of tool.tags) {
      const tagSlug = generateSlug(tagName);

      let tag = await db.query.toolTags.findFirst({
        where: (toolTags, { eq }) => eq(toolTags.slug, tagSlug),
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

      await db.insert(sharedToolTags).values({
        toolId,
        tagId: tag.id,
      });
    }

    console.log(`Created: ${tool.name}`);
  }

  console.log("\nSeeding complete!");
}

seed().catch(console.error);
