"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EnrollButtonProps {
  courseSlug: string;
}

export function EnrollButton({ courseSlug }: EnrollButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState("");

  const handleEnroll = async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/learn/${courseSlug}`);
      return;
    }

    setIsEnrolling(true);
    setError("");

    try {
      const response = await fetch(`/api/courses/${courseSlug}/enroll`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to enroll");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll");
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button onClick={handleEnroll} disabled={isEnrolling} className="w-full">
        {isEnrolling ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enrolling...
          </>
        ) : session?.user ? (
          "Enroll Now - Free"
        ) : (
          "Sign in to Enroll"
        )}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
