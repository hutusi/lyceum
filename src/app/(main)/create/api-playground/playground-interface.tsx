"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Play, Copy, Check, AlertCircle } from "lucide-react";

const modelOptions = {
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  anthropic: [
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
  ],
  opensource: [
    { value: "llama-3.1-70b", label: "Llama 3.1 70B" },
    { value: "llama-3.1-8b", label: "Llama 3.1 8B" },
    { value: "mistral-large", label: "Mistral Large" },
    { value: "mixtral-8x7b", label: "Mixtral 8x7B" },
  ],
};

export function PlaygroundInterface() {
  const [provider, setProvider] = useState<"openai" | "anthropic" | "opensource">("openai");
  const [model, setModel] = useState("gpt-4o");
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleProviderChange = (value: "openai" | "anthropic" | "opensource") => {
    setProvider(value);
    setModel(modelOptions[value][0].value);
    setApiKey("");
    setResponse("");
    setError("");
  };

  const handleSubmit = async () => {
    if (!apiKey) {
      setError("Please enter your API key");
      return;
    }
    if (!prompt) {
      setError("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("/api/playground/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          apiKey,
          prompt,
          systemPrompt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setResponse(data.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Select your model and enter your API key to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Selection */}
          <Tabs value={provider} onValueChange={(v) => handleProviderChange(v as typeof provider)}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
              <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
              <TabsTrigger value="opensource">Open Source</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions[provider].map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={`Enter your ${provider === "openai" ? "OpenAI" : provider === "anthropic" ? "Anthropic" : "provider"} API key`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your API key is sent directly to the provider and is not stored on our servers.
            </p>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt (Optional)</Label>
            <Textarea
              id="systemPrompt"
              placeholder="You are a helpful assistant..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {/* User Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Submit */}
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Response</CardTitle>
              <CardDescription>
                The model&apos;s response will appear here.
              </CardDescription>
            </div>
            {response && (
              <Button variant="outline" size="sm" onClick={copyResponse}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : response ? (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap bg-muted p-4 rounded-lg min-h-[300px]">
              {response}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg min-h-[300px]">
              <p>Response will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
