import { NextResponse } from "next/server";

export function jsonOk<T>(
  data: T,
  init?: ResponseInit & { meta?: Record<string, unknown> },
) {
  const { meta, ...responseInit } = init ?? {};
  return NextResponse.json(meta ? { data, meta } : { data }, responseInit);
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  return NextResponse.json({ error: { code, message, details } }, { status });
}
