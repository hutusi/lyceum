import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { ArrowLeft } from "lucide-react";
import { PublishForm } from "./publish-form";

export const metadata: Metadata = {
  title: "Publish Tool",
  description: "Share your skill, sub-agent, or MCP with the community.",
};

export default async function PublishToolPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/share/publish");
  }

  return (
    <div className="container py-8 max-w-3xl">
      <Link
        href="/share"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Share
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Publish a Tool</h1>
        <p className="text-muted-foreground">
          Share your skill, sub-agent, or MCP with the AI Coding Lyceum community.
          Your submission will be reviewed before being published.
        </p>
      </div>

      <PublishForm />
    </div>
  );
}
