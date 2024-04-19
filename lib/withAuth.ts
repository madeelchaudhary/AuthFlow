"use server";

import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import AuthFlow from ".";
import { AUTH_FLOW_PAGES, AUTH_FLOW_SESSION_OPTIONS } from "./constants";
import { AuthenticationError, UnauthorizedError } from "./errors";
import { decode } from "./jwt"; // Import verification and error handling
import { User } from "./types";

export const withAuth = (
  handler: (
    req?: NextRequest,
    res?: NextResponse,
    user?: any
  ) => Promise<void | any>
) => {
  return async (req: NextRequest, res: NextResponse) => {
    try {
      const token = extractToken(req); // Extract the token from the request

      const payload = await decode(token, AuthFlow.jwtSecret); // Verify the token

      let user: User | null = null;

      if (AUTH_FLOW_SESSION_OPTIONS.strategy === "session") {
        const session = await AuthFlow.adapter.getUserFromSession?.(token); // Retrieve the user session

        if (!session) {
          throw new UnauthorizedError();
        }

        if (session.session.expires < new Date()) {
          throw new UnauthorizedError();
        }

        user = session.user; // Extract the user from the session
      } else {
        user = await AuthFlow.adapter.getUserByEmail(
          (payload as any)._identifier
        ); // Retrieve the user from the database
      }

      if (!user) {
        throw new AuthenticationError("Unauthorized");
      }

      return handler(req, res, user); // Call the protected handler function with the user object
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return redirect(AUTH_FLOW_PAGES.signin); // Redirect to the login page
      }
      // Handle other errors (e.g., database errors)
      console.error(error);
      return redirect(AUTH_FLOW_PAGES.signin);
    }
  };
};

const extractToken = (req: NextRequest) => {
  const cookieName = AUTH_FLOW_SESSION_OPTIONS.cookieName;
  let token = req.cookies.get(cookieName)?.value; // Extract token from cookie

  if (!token) {
    token = req.headers.get("Authorization")?.split(" ")[1]; // Extract token from authorization header
  }

  if (!token) {
    throw new UnauthorizedError();
  }

  return token;
};
