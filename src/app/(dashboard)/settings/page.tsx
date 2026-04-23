"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { apiFetch } from "@/lib/api/client";

type Profile = { id: string; email: string; fullName: string | null };
type Preference = { currency: string; locale: string; theme: "light" | "dark" | "system"; weekStart: "monday" | "sunday" };
type Notification = { id: string; title: string; body: string; readAt: string | null };

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => apiFetch<Profile>("/api/settings/profile") });
  const preferences = useQuery({
    queryKey: ["preferences"],
    queryFn: () => apiFetch<Preference>("/api/settings/preferences"),
  });
  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<Notification[]>("/api/notifications"),
  });

  const [fullNameDraft, setFullNameDraft] = useState<string | undefined>(undefined);
  const [preferenceDraft, setPreferenceDraft] = useState<Preference | undefined>(undefined);
  const fullName = fullNameDraft ?? profile.data?.fullName ?? "";
  const preferenceForm =
    preferenceDraft ??
    preferences.data ?? {
      currency: "USD",
      locale: "en-US",
      theme: "system",
      weekStart: "monday",
    };

  const saveProfile = useMutation({
    mutationFn: async () =>
      apiFetch("/api/settings/profile", {
        method: "PATCH",
        body: JSON.stringify({ fullName }),
      }),
    onSuccess: async () => {
      setFullNameDraft(undefined);
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const savePreferences = useMutation({
    mutationFn: async () =>
      apiFetch("/api/settings/preferences", {
        method: "PATCH",
        body: JSON.stringify(preferenceForm),
      }),
    onSuccess: async () => {
      setPreferenceDraft(undefined);
      await queryClient.invalidateQueries({ queryKey: ["preferences"] });
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) =>
      apiFetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <PageTransition>
      <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-sm font-semibold">Profile</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Input value={fullName} onChange={(event) => setFullNameDraft(event.target.value)} />
          <Input value={profile.data?.email ?? ""} disabled />
          <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>
            Save profile
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Preferences</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            value={preferenceForm.currency}
            onChange={(event) =>
              setPreferenceDraft({ ...preferenceForm, currency: event.target.value.toUpperCase() })
            }
          />
          <Input
            value={preferenceForm.locale}
            onChange={(event) => setPreferenceDraft({ ...preferenceForm, locale: event.target.value })}
          />
          <Select
            value={preferenceForm.theme}
            onChange={(event) =>
              setPreferenceDraft({
                ...preferenceForm,
                theme: event.target.value as "light" | "dark" | "system",
              })
            }
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>
          <Select
            value={preferenceForm.weekStart}
            onChange={(event) =>
              setPreferenceDraft({ ...preferenceForm, weekStart: event.target.value as "monday" | "sunday" })
            }
          >
            <option value="monday">Monday</option>
            <option value="sunday">Sunday</option>
          </Select>
        </div>
        <Button className="mt-3" onClick={() => savePreferences.mutate()} disabled={savePreferences.isPending}>
          Save preferences
        </Button>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Notifications</h2>
        <div className="space-y-2">
          {notifications.data?.map((item) => (
            <div key={item.id} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{item.title}</p>
                {!item.readAt && (
                  <Button variant="ghost" onClick={() => markRead.mutate(item.id)}>
                    Mark read
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </Card>
      </div>
    </PageTransition>
  );
}
