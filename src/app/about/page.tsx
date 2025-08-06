import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - FF Schedule Generator",
};

export default function About() {
  return (
    <main className="flex min-h-screen items-start justify-center p-6">
      <section className="w-full max-w-3xl rounded-2xl bg-white/80 p-8 shadow-xl ring-1 ring-black/5 backdrop-blur-xl dark:bg-gray-950/40 dark:ring-white/10">
        <h1 className="mb-4 text-center text-4xl font-semibold text-gray-900 dark:text-gray-100">About the Scheduler</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          The Fantasy Football Schedule Generator creates balanced matchups using several constraints:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-gray-700 dark:text-gray-300">
          <li>Every team plays every week.</li>
          <li>No team has repeat matchups within any 4 week span.</li>
          <li>
            Soft constraint: out-of-division matchups are avoided in the final two weeks of the season when possible.
          </li>
        </ul>
      </section>
    </main>
  );
}
