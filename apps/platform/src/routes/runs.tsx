import { createFileRoute } from "@tanstack/react-router";
import { RunLog } from "../components/run-log";
import { SAMPLE_RUN } from "../lib/run-log";

export const Route = createFileRoute("/runs")({
  head: () => ({
    meta: [{ title: "Live run — Loome" }],
  }),
  component: RunsPage,
});

function RunsPage() {
  return <RunLog run={SAMPLE_RUN} />;
}
