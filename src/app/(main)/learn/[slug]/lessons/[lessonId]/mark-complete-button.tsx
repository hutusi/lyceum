"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Loader2 } from "lucide-react";

interface MarkCompleteButtonProps {
  courseSlug: string;
  lessonId: string;
  isCompleted: boolean;
}

export function MarkCompleteButton({
  courseSlug,
  lessonId,
  isCompleted,
}: MarkCompleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);

  const handleToggle = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/courses/${courseSlug}/lessons/${lessonId}/progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: !completed }),
        }
      );

      if (response.ok) {
        setCompleted(!completed);
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={completed ? "default" : "outline"}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : completed ? (
        <CheckCircle className="mr-2 h-4 w-4" />
      ) : (
        <Circle className="mr-2 h-4 w-4" />
      )}
      {completed ? "Completed" : "Mark Complete"}
    </Button>
  );
}
