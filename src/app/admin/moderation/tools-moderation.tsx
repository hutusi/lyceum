"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, Star, ExternalLink, Github, Loader2, Terminal, Copy } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  readme: string | null;
  type: string;
  version: string | null;
  repoUrl: string | null;
  installCommand: string | null;
  createdAt: Date | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

interface ToolsModerationProps {
  tools: Tool[];
}

export function ToolsModeration({ tools: initialTools }: ToolsModerationProps) {
  const router = useRouter();
  const [tools, setTools] = useState(initialTools);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectToolId, setRejectToolId] = useState<string | null>(null);

  const handleAction = async (toolId: string, status: "approved" | "featured" | "rejected") => {
    setActionLoading(toolId);

    try {
      const res = await fetch(`/api/admin/tools/${toolId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setTools((prev) => prev.filter((t) => t.id !== toolId));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update tool");
      }
    } catch (error) {
      console.error("Error updating tool:", error);
      alert("Failed to update tool");
    } finally {
      setActionLoading(null);
      setRejectToolId(null);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "skill":
        return <Badge variant="default">Skill</Badge>;
      case "agent":
        return <Badge className="bg-purple-500">Agent</Badge>;
      case "mcp":
        return <Badge className="bg-blue-500">MCP</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  if (tools.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No pending tools to review.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tools.map((tool) => (
        <Card key={tool.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {tool.name}
                  {getTypeBadge(tool.type)}
                  <Badge variant="outline">Pending Review</Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  {tool.description}
                </CardDescription>
              </div>
              {tool.version && (
                <Badge variant="secondary" className="ml-4">
                  v{tool.version}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Submitter Info */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <Avatar className="h-8 w-8">
                <AvatarImage src={tool.user?.image || ""} />
                <AvatarFallback>
                  {tool.user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{tool.user?.name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{tool.user?.email}</p>
              </div>
              <span className="text-xs text-muted-foreground ml-auto">
                Submitted {tool.createdAt?.toLocaleDateString()}
              </span>
            </div>

            {/* Install Command */}
            {tool.installCommand && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <code className="flex-1">{tool.installCommand}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(tool.installCommand || "")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Readme Preview */}
            {tool.readme && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm whitespace-pre-wrap line-clamp-6">
                  {tool.readme}
                </p>
              </div>
            )}

            {/* Links */}
            <div className="flex gap-4">
              {tool.repoUrl && (
                <a
                  href={tool.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Github className="h-4 w-4" />
                  Repository
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => handleAction(tool.id, "approved")}
                disabled={actionLoading === tool.id}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading === tool.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction(tool.id, "featured")}
                disabled={actionLoading === tool.id}
              >
                <Star className="mr-2 h-4 w-4" />
                Approve & Feature
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setRejectToolId(tool.id)}
                disabled={actionLoading === tool.id}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={!!rejectToolId} onOpenChange={() => setRejectToolId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Tool</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this tool? The submitter will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => rejectToolId && handleAction(rejectToolId, "rejected")}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
