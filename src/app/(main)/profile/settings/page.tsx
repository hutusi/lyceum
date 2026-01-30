import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { userSettings, users } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProfileForm } from "./profile-form";
import { SettingsForm } from "./settings-form";
import { PasswordForm } from "./password-form";
import { NotificationForm } from "./notification-form";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your profile and account settings.",
};

async function getUserData(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
    },
  });

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, userId),
  });

  return { user, settings };
}

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { user, settings } = await getUserData(session.user.id!);

  if (!user) {
    redirect("/login");
  }

  const hasPassword = !!user.password;

  return (
    <div className="container py-8 max-w-3xl">
      <Link
        href="/profile"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Profile
      </Link>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your profile and account settings.
          </p>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your public profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initialData={{
                name: user.name || "",
                image: user.image || "",
              }}
            />
          </CardContent>
        </Card>

        {/* Bio & Links Section */}
        <Card>
          <CardHeader>
            <CardTitle>Bio & Links</CardTitle>
            <CardDescription>
              Tell others about yourself and share your links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm
              initialData={{
                bio: settings?.bio || "",
                website: settings?.website || "",
                location: settings?.location || "",
                github: settings?.github || "",
                twitter: settings?.twitter || "",
              }}
            />
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              {hasPassword
                ? "Change your password."
                : "Set a password to enable email/password login."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm hasExistingPassword={hasPassword} />
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage your email notification preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationForm
              initialData={{
                emailNotifications: settings?.emailNotifications ?? true,
                weeklyDigest: settings?.weeklyDigest ?? true,
                courseUpdates: settings?.courseUpdates ?? true,
                discussionReplies: settings?.discussionReplies ?? true,
                projectFeedback: settings?.projectFeedback ?? true,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
