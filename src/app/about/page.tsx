import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - FF Schedule Generator",
};

export default function About() {
  return (
    <main className="p-6 max-w-2xl mx-auto min-h-screen bg-gray-950 text-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-white">About the Scheduler</h1>
      <p className="mb-4 text-gray-300">
        The Fantasy Football Schedule Generator creates balanced matchups using several constraints:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-300">
        <li>Every team plays every week.</li>
        <li>No team has repeat matchups within any 4 week span.</li>
        <li>
          Soft constraint: out-of-division matchups are avoided in the final two weeks of the season when possible.
        </li>
      </ul>
    </main>
  );
}
