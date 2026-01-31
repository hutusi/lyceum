"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center max-w-md px-4">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-muted-foreground/20 mb-4">500</h1>
            <h2 className="text-2xl font-bold">Server Error</h2>
            <p className="text-muted-foreground mt-2">
              We&apos;re experiencing technical difficulties. Please try again later.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-4 font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try Again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
