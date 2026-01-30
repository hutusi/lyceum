"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

interface NotificationFormProps {
  initialData: {
    emailNotifications: boolean;
    weeklyDigest: boolean;
    courseUpdates: boolean;
    discussionReplies: boolean;
    projectFeedback: boolean;
  };
}

export function NotificationForm({ initialData }: NotificationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update notifications");
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const notifications = [
    {
      id: "emailNotifications",
      label: "Email Notifications",
      description: "Receive email notifications",
    },
    {
      id: "weeklyDigest",
      label: "Weekly Digest",
      description: "Get a weekly summary of activity",
    },
    {
      id: "courseUpdates",
      label: "Course Updates",
      description: "Notifications about courses you're enrolled in",
    },
    {
      id: "discussionReplies",
      label: "Discussion Replies",
      description: "Notifications when someone replies to your discussions",
    },
    {
      id: "projectFeedback",
      label: "Project Feedback",
      description: "Notifications about your submitted projects",
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={notification.id}>{notification.label}</Label>
              <p className="text-sm text-muted-foreground">
                {notification.description}
              </p>
            </div>
            <Switch
              id={notification.id}
              checked={formData[notification.id as keyof typeof formData]}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, [notification.id]: checked })
              }
            />
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-600">Notification preferences updated!</p>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Preferences
      </Button>
    </form>
  );
}
