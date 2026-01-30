import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PlaygroundInterface } from "./playground-interface";

export const metadata: Metadata = {
  title: "API Playground",
  description: "Test and experiment with AI model APIs.",
};

export default function ApiPlaygroundPage() {
  return (
    <div className="container py-8">
      <Link
        href="/create"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Create
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Playground</h1>
        <p className="text-muted-foreground">
          Test and experiment with various AI model APIs. Bring your own API key to get started.
        </p>
      </div>

      <PlaygroundInterface />
    </div>
  );
}
