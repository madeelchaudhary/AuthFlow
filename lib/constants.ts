import { AuthPages, SessionOptions } from "./types";

export const AUTH_FLOW_PAGES: AuthPages = {
  signin: "/signin",
  signup: "/signup",
};

export const AUTH_FLOW_SESSION_OPTIONS: SessionOptions = {
  cookieName: "auth_flow.session-token",
  strategy: "jwt",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};
