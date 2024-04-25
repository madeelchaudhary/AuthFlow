/**
 * Custom error classes
 * @module lib/errors
 * @packageDocumentation
 * This module contains custom error classes that are used in the authentication flow.
 *
 */

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor() {
    super("Token has expired");
    this.name = "TokenExpiredError";
  }
}

export class TokenInvalidError extends AuthenticationError {
  constructor() {
    super("Token is invalid");
    this.name = "TokenInvalidError";
  }
}

export class UserNotFoundError extends AuthenticationError {
  constructor() {
    super("User does not exist");
    this.name = "UserNotFoundError";
  }
}

export class UserExistsError extends AuthenticationError {
  constructor() {
    super("User already exists");
    this.name = "UserExistsError";
  }
}

export class PasswordMismatchError extends AuthenticationError {
  constructor() {
    super("Password does not match");
    this.name = "PasswordMismatchError";
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export class SessionNotFoundError extends AuthenticationError {
  constructor() {
    super("Session not found");
    this.name = "SessionNotFoundError";
  }
}

export class SessionExpiredError extends AuthenticationError {
  constructor() {
    super("Session has expired");
    this.name = "SessionExpiredError";
  }
}

export class UnauthorizedError extends AuthenticationError {
  constructor() {
    super("You are not authorized to access this resource");
    this.name = "UnauthorizedError";
  }
}
