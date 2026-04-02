import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Link2Off } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you requested could not be found on FlexoHost.",
};

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,hsl(var(--primary)_/_0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,hsl(var(--primary)_/_0.22),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2] [background-image:linear-gradient(hsl(var(--foreground)_/_0.06)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)_/_0.06)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />

      <div className="relative z-10 max-w-lg w-full text-center space-y-10">
        <Link
          href="/"
          className="relative mx-auto block h-10 w-44 transition-opacity hover:opacity-90"
        >
          <Image
            src="/img/company/FlexoHostHorizontalforLight.webp"
            alt="FlexoHost"
            fill
            className="object-contain dark:hidden"
            priority
          />
          <Image
            src="/img/company/FlexoHostHorizontalforDark.webp"
            alt="FlexoHost"
            fill
            className="hidden object-contain dark:block"
            priority
          />
        </Link>

        {/* 404 mark — refined, less decorative than the cloud “0” */}
        <div
          className="relative mx-auto w-full max-w-[22rem] sm:max-w-md"
          aria-hidden
        >
          <div className="absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-primary/35 via-primary/12 to-transparent opacity-90 dark:from-primary/40 dark:via-primary/15" />
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-background/80 px-4 py-8 shadow-lg shadow-primary/5 backdrop-blur-md dark:border-white/10 dark:bg-gray-950/75 dark:shadow-primary/10 sm:px-4 sm:py-9">
            <div
              className="pointer-events-none absolute -right-20 -top-16 h-36 w-36 rounded-full bg-primary/18 blur-3xl dark:bg-primary/15"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl dark:bg-primary/12"
              aria-hidden
            />

            <div className="relative flex items-center justify-center gap-1 sm:gap-1.5">
              <span className="select-none tabular-nums text-[clamp(3rem,13vw,5.25rem)] font-semibold leading-none tracking-[-0.04em] text-foreground">
                4
              </span>

              <div className="relative mx-0.5 flex h-[clamp(2.65rem,11.5vw,4.6rem)] w-[clamp(2.65rem,11.5vw,4.6rem)] shrink-0 items-center justify-center sm:mx-1">
                <div className="absolute inset-0 rounded-full border-2 border-primary/40 dark:border-primary/45" />
                <div className="absolute inset-[14%] rounded-full border border-border/80 bg-muted/30 dark:border-white/10 dark:bg-muted/20" />
                <Link2Off
                  className="relative z-10 h-[38%] w-[38%] text-primary"
                  strokeWidth={1.5}
                />
              </div>

              <span className="select-none tabular-nums text-[clamp(3rem,13vw,5.25rem)] font-semibold leading-none tracking-[-0.04em] text-foreground">
                4
              </span>
            </div>

            <p className="relative mt-5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Error 404 · Resource unavailable
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Page not found
          </h1>
          <p className="text-muted-foreground text-pretty max-w-md mx-auto">
            This URL isn&apos;t part of your FlexoHost billing portal. It may
            have been removed, renamed, or the link might be incorrect.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:bg-primary/90"
          >
            Back to dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent"
          >
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
}
