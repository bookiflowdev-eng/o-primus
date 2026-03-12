"use client";

export function BenchmarkRunList({ runs, onSelect }) {

  if (!runs?.length) {
    return <div>No runs yet</div>;
  }

  return (
    <div>
      <h3>Runs</h3>

      {runs.map((run) => (
        <div
          key={run.runId}
          style={{
            border: "1px solid #333",
            padding: 10,
            marginBottom: 8,
            cursor: "pointer"
          }}
          onClick={() => onSelect(run.runId)}
        >
          <div><strong>{run.sourceDomain}</strong></div>
          <div>score: {run.completenessScore}</div>
          <div>next: {run.nextStep}</div>
        </div>
      ))}
    </div>
  );
}