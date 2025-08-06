import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - FF Schedule Generator",
};

export default function About() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <section className="max-w-2xl w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-lg p-8 transition-transform duration-300 hover:scale-[1.01]">
        <h1 className="text-4xl font-semibold tracking-tight text-center mb-6">About the Scheduler</h1>
        <p className="mb-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          The Fantasy Football Schedule Generator creates balanced matchups using several constraints:
        </p>
        <ul className="list-disc pl-5 space-y-3 text-gray-700 dark:text-gray-300">
          <li className="leading-relaxed">Every team plays every week.</li>
          <li className="leading-relaxed">No team has repeat matchups within any 4 week span.</li>
          <li className="leading-relaxed">
            Soft constraint: out-of-division matchups are avoided in the final two weeks of the season when possible.
          </li>
        </ul>
      </section>
    </main>
  );
}
