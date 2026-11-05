"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="standalone" id="main-content"><h1>This page could not be loaded.</h1><p>Please try again. If you still need help, contact the school office.</p><button className="button primary" onClick={reset}>Try again</button></main>;
}
