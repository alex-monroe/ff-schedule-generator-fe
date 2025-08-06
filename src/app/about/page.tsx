import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - FF Schedule Generator",
};

export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <section className="max-w-2xl w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur rounded-xl shadow-lg p-8 text-gray-700 dark:text-gray-300">
        <h1 className="text-4xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">
          About the Scheduler
        </h1>
        <p className="mb-6 leading-relaxed text-center">
          The Fantasy Football Schedule Generator creates balanced matchups using several constraints:
        </p>
        <ul className="list-disc pl-6 space-y-3">
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
