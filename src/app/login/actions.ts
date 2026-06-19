"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function loginError(message: string) {
  redirect(`/login?message=${encodeURIComponent(message)}`);
}

export async function requestMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    loginError("Email is required");
  }

  const origin = headers().get("origin") ?? "http://localhost:3000";
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    loginError(error.message);
  }

  redirect("/login?message=Check%20your%20email%20for%20the%20login%20link");
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    loginError("Email and password are required");
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    loginError(error.message);
  }

  redirect("/dashboard");
}
