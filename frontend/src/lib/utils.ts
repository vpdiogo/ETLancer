export function tryParseJson(
  value: string,
): { ok: true; data: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(value) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
