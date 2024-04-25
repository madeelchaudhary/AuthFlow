import { AuthConfig, AuthPages, SessionOptions } from "./types";
import { getSecret } from "./utils";

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

export const AUTH_FLOW_MICS: {
  jwtSecret: AuthConfigRequired["jwtSecret"];
  identifier: AuthConfigRequired["identifier"];
  adapter?: AuthConfigRequired["adapter"];
} = {
  jwtSecret: "default_secret_used_by_auth_flow",
  identifier: "email",
  adapter: undefined,
};

type AuthConfigRequired = Required<AuthConfig>;

export const setAuthFlowConfig = (config: AuthConfig) => {
  AUTH_FLOW_MICS.jwtSecret =
    getSecret(config.jwtSecret) || AUTH_FLOW_MICS.jwtSecret;
  AUTH_FLOW_MICS.identifier = config.identifier || AUTH_FLOW_MICS.identifier;
  AUTH_FLOW_MICS.adapter = config.adapter || AUTH_FLOW_MICS.adapter;

  AUTH_FLOW_PAGES.signin = config.pages?.signin || AUTH_FLOW_PAGES.signin;
  AUTH_FLOW_PAGES.signup = config.pages?.signup || AUTH_FLOW_PAGES.signup;
  AUTH_FLOW_PAGES.error = config.pages?.error || AUTH_FLOW_PAGES.error;

  AUTH_FLOW_SESSION_OPTIONS.cookieName =
    config.session?.cookieName || AUTH_FLOW_SESSION_OPTIONS.cookieName;
  AUTH_FLOW_SESSION_OPTIONS.strategy =
    config.session?.strategy || AUTH_FLOW_SESSION_OPTIONS.strategy;
  AUTH_FLOW_SESSION_OPTIONS.maxAge =
    config.session?.maxAge || AUTH_FLOW_SESSION_OPTIONS.maxAge;
};

export const getAuthFlowConfig = () => {
  return {
    jwtSecret: AUTH_FLOW_MICS.jwtSecret,
    identifier: AUTH_FLOW_MICS.identifier,
    adapter: AUTH_FLOW_MICS.adapter,
    pages: AUTH_FLOW_PAGES,
    session: AUTH_FLOW_SESSION_OPTIONS,
  };
};
