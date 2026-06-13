import "~/styles/globals.css";

import { type Metadata } from "next";

import { Providers } from "~/app/_components/providers";
import { NavBar } from "~/app/_components/nav-bar";

export const metadata: Metadata = {
  title: "Rocklog",
  description: "Log the climbs you send at the gym.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
