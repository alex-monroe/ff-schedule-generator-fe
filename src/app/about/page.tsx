import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - FF Schedule Generator",
};

export default function About() {
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">About the Scheduler</h1>
      <p className="mb-4">
        The Fantasy Football Schedule Generator creates balanced matchups using several constraints:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Every team plays every week.</li>
        <li>No team has repeat matchups within any 4 week span.</li>
        <li>
          Soft constraint: out-of-division matchups are avoided in the final two weeks of the season when possible.
        </li>
      </ul>
    </main>
  );
}
