"use client";

import React from "react";

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  // Simple markdown-like rendering
  // For production, consider using react-markdown or MDX
  const renderContent = (text: string) => {
    // Split by double newlines for paragraphs
    const blocks = text.split(/\n\n+/);

    return blocks.map((block, index) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // Headings
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
            {trimmed.slice(4)}
          </h3>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={index} className="text-2xl font-semibold mt-8 mb-4">
            {trimmed.slice(3)}
          </h2>
        );
      }
      if (trimmed.startsWith("# ")) {
        return (
          <h1 key={index} className="text-3xl font-bold mt-8 mb-4">
            {trimmed.slice(2)}
          </h1>
        );
      }

      // Code blocks
      if (trimmed.startsWith("```")) {
        const lines = trimmed.split("\n");
        const language = lines[0].slice(3);
        const code = lines.slice(1, -1).join("\n");
        return (
          <pre
            key={index}
            className="bg-muted rounded-lg p-4 overflow-x-auto my-4 text-sm"
          >
            <code className={`language-${language}`}>{code}</code>
          </pre>
        );
      }

      // Blockquotes
      if (trimmed.startsWith("> ")) {
        const quoteLines = trimmed
          .split("\n")
          .map((line) => line.replace(/^>\s?/, ""))
          .join("\n");
        return (
          <blockquote
            key={index}
            className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4"
          >
            {quoteLines}
          </blockquote>
        );
      }

      // Unordered lists
      if (trimmed.match(/^[-*]\s/m)) {
        const items = trimmed.split(/\n/).filter((line) => line.match(/^[-*]\s/));
        return (
          <ul key={index} className="list-disc list-inside space-y-1 my-4">
            {items.map((item, i) => (
              <li key={i}>{renderInline(item.replace(/^[-*]\s/, ""))}</li>
            ))}
          </ul>
        );
      }

      // Ordered lists
      if (trimmed.match(/^\d+\.\s/m)) {
        const items = trimmed.split(/\n/).filter((line) => line.match(/^\d+\.\s/));
        return (
          <ol key={index} className="list-decimal list-inside space-y-1 my-4">
            {items.map((item, i) => (
              <li key={i}>{renderInline(item.replace(/^\d+\.\s/, ""))}</li>
            ))}
          </ol>
        );
      }

      // Horizontal rule
      if (trimmed === "---" || trimmed === "***") {
        return <hr key={index} className="my-8 border-t" />;
      }

      // Regular paragraphs
      return (
        <p key={index} className="my-4 leading-relaxed">
          {renderInline(trimmed)}
        </p>
      );
    });
  };

  const renderInline = (text: string) => {
    // Handle inline formatting
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    // Process bold, italic, code, and links
    while (remaining.length > 0) {
      // Bold
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Italic
      const italicMatch = remaining.match(/\*(.+?)\*/);
      // Inline code
      const codeMatch = remaining.match(/`(.+?)`/);
      // Links
      const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);

      const matches = [
        { match: boldMatch, type: "bold" },
        { match: italicMatch, type: "italic" },
        { match: codeMatch, type: "code" },
        { match: linkMatch, type: "link" },
      ]
        .filter((m) => m.match)
        .sort((a, b) => (a.match?.index || 0) - (b.match?.index || 0));

      if (matches.length === 0) {
        parts.push(remaining);
        break;
      }

      const first = matches[0];
      const match = first.match!;
      const index = match.index!;

      // Add text before match
      if (index > 0) {
        parts.push(remaining.slice(0, index));
      }

      // Add formatted element
      if (first.type === "bold") {
        parts.push(<strong key={key++}>{match[1]}</strong>);
      } else if (first.type === "italic") {
        parts.push(<em key={key++}>{match[1]}</em>);
      } else if (first.type === "code") {
        parts.push(
          <code key={key++} className="bg-muted px-1.5 py-0.5 rounded text-sm">
            {match[1]}
          </code>
        );
      } else if (first.type === "link") {
        parts.push(
          <a
            key={key++}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {match[1]}
          </a>
        );
      }

      remaining = remaining.slice(index + match[0].length);
    }

    return parts;
  };

  return (
    <article className="prose prose-lg max-w-none dark:prose-invert">
      {renderContent(content)}
    </article>
  );
}
