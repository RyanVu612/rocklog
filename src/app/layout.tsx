import "~/styles/globals.css";

import { type Metadata } from "next";
import { Archivo_Black, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

import { Providers } from "~/app/_components/providers";
import { NavBar } from "~/app/_components/nav-bar";

// Display: planted, monumental — route-setter signage.
const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--rl-font-display",
});
// Body: a warm grotesque, not the usual Inter.
const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--rl-font-body",
});
// Utility: grades are codes on a scale, so they live in mono.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--rl-font-mono",
});

export const metadata: Metadata = {
  title: "Rocklog",
  description: "Log the climbs you send at the gym.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// Resolve the theme before first paint so there is no flash of the wrong
// theme: a saved choice wins, else the OS preference, else dark.
const themeScript = `(function(){try{var t=localStorage.getItem('rl-theme');if(t!=='light'&&t!=='dark'){if(window.matchMedia){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}else{t='dark';}}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          <NavBar />
          <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
