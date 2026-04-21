import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, { status: 200, ...init });
}

export function jsonCreated<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, { status: 201, ...init });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof Error && error.message === "Unauthorized") {
    return jsonError("Unauthorized", 401);
  }

  if (error instanceof SyntaxError) {
    return jsonError("Invalid request body", 400);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return jsonError("The service is temporarily unavailable. Please try again in a moment.", 503);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021") {
      return jsonError("We’re setting things up right now. Please try again shortly.", 503);
    }

    if (error.code === "P2002") {
      return jsonError("A record with that value already exists.", 409);
    }

    if (error.code === "P2025") {
      return jsonError("The requested record was not found.", 404);
    }
  }

  console.error("Unhandled API error", error);
  return jsonError("Something went wrong. Please try again.", 500);
}

export async function withErrorHandling(handler: () => Promise<Response>) {
  try {
    return await handler();
  } catch (error) {
    return handleRouteError(error);
  }
}
