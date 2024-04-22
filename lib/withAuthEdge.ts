import { NextRequest, NextResponse } from "next/server";
import { getAuthFlowConfig, setAuthFlowConfig } from "./constants";
import { AuthenticationError, UnauthorizedError } from "./errors";
import { decode } from "./jwt"; // Import verification and error handling
import { AuthConfig } from "./types";

interface WithAuthHandler {
  (req: NextRequest, res: NextResponse, jwt: Record<string, any>): Promise<
    void | any
  >;
}

interface WithAuthPages {
  /**
   *  Public pages that do not require authentication
   * @default []
   *
   * @example
   * ```ts
   * {
   *  public: ["/", "/about"]
   * }
   */
  public?: string[];

  /**
   * Override the default error page for authentication errors.
   *
   * @remarks
   * You can set this in the `AuthFlow` configuration.
   */
  error?: string;

  /**
   * Override the default sign-in page.
   *
   * @remarks
   * You can set this in the `AuthFlow` configuration.
   */
  signin?: string;

  /**
   * Pages that if accessed by an authenticated user will redirect to the home page.
   */
  unAuthonticated?: string[];

  /**
   * Page to redirect to a user that is authenticated and tries to access a page in the `unAuthonticated` list or `signin' page.
   * @default "/"
   *
   * @remarks
   * This page should be a public page. If not, in certain cases, it will cause a redirect loop.
   */
  home?: string;
}

interface WithAuthOptions {
  pages?: WithAuthPages;
  config: AuthConfig;
}

/**
 * Middleware to enable authentication on routes. It decodes the JWT token and calls the handler function with the decoded payload. It does not need any database calls to verify the user. It only verifies the JWT token.
 *
 * @param options - Configuration options for the middleware. You have to provide the `config` and can optionally provide the `pages` object.
 * @param handler - Function to run after the middleware has authenticated the user or if the user is on a public page. The function receives the request, response, and JWTPayload. If no handler is provided, the middleware will call the next middleware.
 * @returns A middleware function that protects routes that require authentication.
 *
 */
export default function withAuthEdge(
  { config, pages }: WithAuthOptions,
  handler?: WithAuthHandler
) {
  setAuthFlowConfig(config); // Set the configuration for the authentication flow
  const {
    jwtSecret,
    pages: authFlowPages,
    session: { cookieName },
  } = getAuthFlowConfig(); // Retrieve the configuration

  return async function (req: NextRequest, res: NextResponse) {
    const unAuthonticatedPages = pages?.unAuthonticated || [];
    const homePage = pages?.home || "/";
    const errorPage = pages?.error || authFlowPages.error;
    const signinPage = pages?.signin || authFlowPages.signin;
    const publicPages = pages?.public || [];

    publicPages.push(errorPage, authFlowPages.signup);

    const path = req.nextUrl.pathname;

    if (
      publicPages.includes(path) ||
      publicPages.some((page) => path.startsWith(page))
    ) {
      return NextResponse.next(); // Call the next middleware if the user is on a public page
    }

    try {
      const token = extractToken(req, cookieName); // Extract the token from the request

      const payload = await decode({
        token,
        secret: jwtSecret,
      }); // Verify the token

      if (
        unAuthonticatedPages.includes(path) ||
        unAuthonticatedPages.some((page) => path.startsWith(page)) ||
        path.startsWith(signinPage)
      ) {
        return NextResponse.redirect(new URL(homePage, req.url)); // Redirect to the home page if the user is on an unauthenticated page
      }

      if (!handler) {
        return NextResponse.next(); // Call the next middleware if no handler is provided
      }

      return handler(req, res, payload); // Call the protected handler function with the user object
    } catch (error) {
      if (path.startsWith(signinPage)) {
        return NextResponse.next(); // Call the next middleware if the user is on an auth page
      }

      if (error instanceof AuthenticationError) {
        return NextResponse.redirect(new URL(signinPage, req.url)); // Redirect to the sign-in page
      }
      // Handle other errors (e.g., database errors)
      console.error(error, "Error in withAuth middleware"); // Log the error
      return NextResponse.redirect(new URL(errorPage, req.url)); // Redirect to the error page
    }
  };
}

const extractToken = (req: NextRequest, cookieName: string) => {
  let token = req.cookies.get(cookieName)?.value; // Extract token from cookie

  if (!token) {
    token = req.headers.get("Authorization")?.split(" ")[1]; // Extract token from authorization header
  }

  if (!token) {
    throw new UnauthorizedError();
  }

  return token;
};
