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

export class EmailExistsError extends AuthenticationError {
  constructor() {
    super("Email already exists");
    this.name = "EmailExistsError";
  }
}

export class EmailNotFoundError extends AuthenticationError {
  constructor() {
    super("Email not found");
    this.name = "EmailNotFoundError";
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
