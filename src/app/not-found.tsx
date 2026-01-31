import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
          <h2 className="text-2xl font-bold mt-4">Page Not Found</h2>
          <p className="text-muted-foreground mt-2">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been
            moved, deleted, or never existed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/news">
              <Search className="mr-2 h-4 w-4" />
              Browse Articles
            </Link>
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Looking for something specific? Try these sections:
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <Link href="/news" className="text-sm text-primary hover:underline">
              News
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/learn" className="text-sm text-primary hover:underline">
              Courses
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/practice" className="text-sm text-primary hover:underline">
              Practice
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/create" className="text-sm text-primary hover:underline">
              Create
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/share" className="text-sm text-primary hover:underline">
              Share
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
