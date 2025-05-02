import { NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === "development";

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export const handleAppError = (err: unknown) => {
  if (err instanceof AppError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  console.error("Unexpected error:", err);

  return NextResponse.json(
    {
      error:
        isDev && err instanceof Error ? err.message : "Internal Server Error",
    },
    { status: 500 }
  );
};
