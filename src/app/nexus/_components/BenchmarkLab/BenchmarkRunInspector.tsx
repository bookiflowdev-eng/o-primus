"use client";

export function BenchmarkRunInspector({ run, error }) {

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!run) {
    return <div>Select a run</div>;
  }

  return (
    <div>

      <h2>Run Inspector</h2>

      <pre style={{
        background: "#111",
        padding: 20,
        overflow: "auto",
        maxHeight: "80vh"
      }}>
        {JSON.stringify(run, null, 2)}
      </pre>

    </div>
  );
}