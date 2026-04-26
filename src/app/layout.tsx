import type { Metadata } from "next";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import type { Route } from "next";
import Link from "next/link";

import { Providers } from "@/components/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Remote Control",
  description: "A multi-user remote command surface for local AI dev tools like Codex and Cursor."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <div className="app-frame">
            <header className="site-header">
              <Link className="brand-mark" href={"/" as Route}>
                Remote Control
              </Link>
              <div className="topbar-actions">
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className="chip" type="button">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="primary-button" type="button">
                      Sign up
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </header>
            <Providers>{children}</Providers>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
