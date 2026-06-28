// Directory: /opt/aetheros/cph-hub/telemetry/
// Filename: ingest_span.js
// Purpose: Parses and appends incoming OTLP span JSON logs to the historical telemetry ledger.

const fs = require('fs');
const path = require('path');

function ingestTelemetrySpan(rawSpanStr) {
    const logFile = path.join(__dirname, 'telemetry_history.jsonlog');
    
    try {
        const spanData = JSON.parse(rawSpanStr);
        
        // Calculate exact execution duration in milliseconds
        const start = BigInt(spanData.start_time_unix_nano);
        const end = BigInt(spanData.end_time_unix_nano);
        const durationMs = Number(end - start) / 1_000_000;
        
        // Construct standard ledger record object
        const entry = {
            timestamp: new Date().toISOString(),
            traceId: spanData.trace_id,
            spanId: spanData.span_id,
            parentSpanId: spanData.parent_span_id,
            operation: spanData.name,
            duration_ms: durationMs,
            body: spanData.body,
            status: spanData.status.message
        };
        
        // Append entry to historical ledger line-by-line
        fs.appendFileSync(logFile, JSON.stringify(entry) + '\n', 'utf8');
        console.log(`[SUCCESS] Telemetry operation '${entry.operation}' appended to ledger (${durationMs} ms).`);
        
    } catch (error) {
        console.error("[ERROR] Failed to ingest raw span metadata:", error.message);
    }
}

// Ingestion input container
const incomingPayload = `{
  "trace_id": "d5fa70b95e2c72b7ac5c7de84f8",
  "span_id": "5d11985a631128",
  "parent_span_id": "6dd7a44f4fd758",
  "name": "broadcastEpochAnchor",
  "kind": "INTERNAL",
  "start_time_unix_nano": 1782533058845000000,
  "end_time_unix_nano": 1782533058866000000,
  "body": "Pushing context span 'chronos.sync.epoch' with UTC standard metric to all listening nodes.",
  "status": {
    "code": 1,
    "message": "STATUS_CODE_OK"
  },
  "resource": {
    "attributes": {
      "service.name": "aetheros.ai.conjunction.service",
      "telemetry.sdk.name": "@opentelemetry/sdk-trace-web",
      "telemetry.sdk.language": "typescript"
    }
  }
}`;

ingestTelemetrySpan(incomingPayload);
