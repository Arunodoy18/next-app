import type { Metadata } from "next";
import { Questrial } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import QueryProvider from "@/components/query-provider";
import SuperuserBubble from "@/components/misc/superuser-bubble";
import { PlaceholderProvider } from "@/components/misc/use-placeholder";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const questrial = Questrial({
  weight: "400",
  variable: "--font-questrial",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Blackmont Academy",
    template: "%s",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${questrial.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <PlaceholderProvider>
              <ThemeToggle />
              {children}
              <SuperuserBubble />
              <Toaster />
            </PlaceholderProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
