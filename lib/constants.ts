import { AuthPages, SessionOptions } from "./types";

/**
 * Constants for the authentication flow.
 *
 * @packageDocumentation
 * This module contains constants for the authentication flow. These constants are used to configure the authentication flow.
 *
 */

export const AUTH_FLOW_PAGES: AuthPages = {
  signin: "/signin",
  signup: "/signup",
  error: "/error",
};

export const AUTH_FLOW_SESSION_OPTIONS: SessionOptions = {
  cookieName: "auth_flow.session-token",
  strategy: "jwt",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};
