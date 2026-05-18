const DEFAULT_REDACT_KEYS = ["token", "secret", "password", "apiKey", "authorization"];

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function serializeError(error) {
  if (!error) return null;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }
  return {
    name: "NonError",
    message: String(error)
  };
}

export function redactMetadata(metadata, redactKeys = DEFAULT_REDACT_KEYS) {
  if (!isPlainObject(metadata)) return metadata ?? {};
  const blocked = new Set(redactKeys.map((key) => key.toLowerCase()));

  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => {
      if (blocked.has(key.toLowerCase())) return [key, "[REDACTED]"];
      if (isPlainObject(value)) return [key, redactMetadata(value, redactKeys)];
      return [key, value];
    })
  );
}

export function createLogger({ namespace = "app", sink = console, getCorrelationId } = {}) {
  function write(level, event, metadata = {}) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      namespace,
      event,
      correlationId: getCorrelationId?.() ?? null,
      ...redactMetadata(metadata)
    };
    const method = level === "error" ? "error" : level === "warn" ? "warn" : "info";
    sink[method]?.(JSON.stringify(payload));
    return payload;
  }

  return {
    debug: (event, metadata) => write("debug", event, metadata),
    info: (event, metadata) => write("info", event, metadata),
    warn: (event, metadata) => write("warn", event, metadata),
    error: (event, metadata) => write("error", event, metadata)
  };
}

export const appLogger = createLogger({ namespace: "hero-forge" });
