import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { ArrowLeft } from "lucide-react";
import { ProjectSubmitForm } from "./project-submit-form";

export const metadata: Metadata = {
  title: "Submit Project",
  description: "Submit your AI project to the showcase.",
};

export default async function SubmitProjectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container py-8 max-w-2xl">
      <Link
        href="/create/showcase"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Showcase
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Submit Your Project</h1>
        <p className="text-muted-foreground">
          Share your AI project with the community. Projects will be reviewed before appearing in the showcase.
        </p>
      </div>

      <ProjectSubmitForm />
    </div>
  );
}
