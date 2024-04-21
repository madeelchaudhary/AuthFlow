import bcrypt from "bcrypt";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { AUTH_FLOW_PAGES, AUTH_FLOW_SESSION_OPTIONS } from "./constants";
import {
  AuthenticationError,
  InvalidCredentialsError,
  PasswordMismatchError,
  SessionExpiredError,
  TokenExpiredError,
  UnauthorizedError,
  UserExistsError,
  UserNotFoundError,
} from "./errors";
import { decode, encode } from "./jwt";
import {
  Adapter,
  AuthConfig,
  AuthPages,
  Session,
  SessionOptions,
  SignInBaseSchema,
  SignUpBaseSchema,
  User,
} from "./types";
import { SignInSchema, SignUpSchema } from "./validation";

export default class AuthFlow<
  TSessionData extends Record<string, any> = DefaultSessionData
> {
  private adapter: Adapter;
  private jwtSecret: string;
  private identifier: string | number;
  private loginValidationSchema: SignInBaseSchema;
  private signupValidationSchema: SignUpBaseSchema;
  private callbacks: AuthConfig["callbacks"];

  private sessionOptions: SessionOptions = AUTH_FLOW_SESSION_OPTIONS;
  private pages: AuthPages = AUTH_FLOW_PAGES;

  public static jwtSecret: string;
  public static adapter: Adapter;

  constructor(config: AuthConfig) {
    this.jwtSecret = this.getSecret(config.jwtSecret);
    this.adapter = config.adapter;
    this.callbacks = config.callbacks;

    this.identifier = config.identifier || "email";
    this.loginValidationSchema =
      config.schema?.login?.validationSchema || SignInSchema;
    this.signupValidationSchema =
      config.schema?.signup?.validationSchema || SignUpSchema;

    AuthFlow.jwtSecret = this.jwtSecret;
    AuthFlow.adapter = this.adapter;

    AUTH_FLOW_PAGES.signin = config?.pages?.signin || AUTH_FLOW_PAGES.signin;
    AUTH_FLOW_PAGES.signup = config?.pages?.signup || AUTH_FLOW_PAGES.signup;
    AUTH_FLOW_PAGES.error = config?.pages?.error || AUTH_FLOW_PAGES.error;

    AUTH_FLOW_SESSION_OPTIONS.cookieName =
      config?.session?.cookieName || AUTH_FLOW_SESSION_OPTIONS.cookieName;
    AUTH_FLOW_SESSION_OPTIONS.strategy =
      config?.session?.strategy || AUTH_FLOW_SESSION_OPTIONS.strategy;
    AUTH_FLOW_SESSION_OPTIONS.maxAge =
      config?.session?.maxAge || AUTH_FLOW_SESSION_OPTIONS.maxAge;
  }

  private getSecret(secret: string | undefined): string {
    return (
      secret || process.env.JWT_SECRET || "default_secret_used_by_auth_flow"
    );
  }

  signUp = async (payload: z.infer<SignUpBaseSchema>) => {
    try {
      // Validate user data using Zod
      const validationResult = this.signupValidationSchema.safeParse(payload);

      if (!validationResult.success) {
        throw new InvalidCredentialsError();
      }

      const user = validationResult.data;

      // Check if user already exists in database
      const userExists = await this.adapter.getUserByIdentifier(
        user[this.identifier]
      );

      if (userExists) {
        throw new UserExistsError();
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const newUser = {
        ...user,
        hashedPassword,
        confirmPassword: undefined,
        password: undefined,
      };

      // Create user in database
      await this.adapter.createUser(newUser);

      return {
        status: "success",
        message: "You have successfully signed up. Please sign in.",
      } as const;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return {
          status: "error",
          error: error.message,
        } as const;
      }
      // Handle signup errors
      console.error(error);
      return {
        status: "error",
        error: "An error occurred while signing up. Please try again.",
      } as const;
    }
  };

  signIn = async (payload: z.infer<SignInBaseSchema>) => {
    try {
      // Validate user credentials using Zod
      const validationResult = this.loginValidationSchema.safeParse(payload);

      if (!validationResult.success) {
        throw new InvalidCredentialsError();
      }

      const credentials = validationResult.data;

      // Find user in database by identifier
      const user = await this.adapter.getUserByIdentifier(
        credentials[this.identifier]
      );

      if (!user) {
        throw new UserNotFoundError();
      }

      // Compare password hashes
      const isValidPassword = await bcrypt.compare(
        credentials.password,
        user.hashedPassword
      );

      if (!isValidPassword) {
        throw new PasswordMismatchError();
      }

      // Generate JWT token
      let tokenPayload = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        _identifier: user[this.identifier],
      };

      this?.callbacks?.jwt?.(user, tokenPayload);

      tokenPayload._identifier = user[this.identifier];

      const token = await encode({
        payload: tokenPayload,
        secret: this.jwtSecret,
        expiresIn: this.sessionOptions.maxAge,
      });

      // Create JWT token or database session based on chosen strategy
      if (this.sessionOptions.strategy === "session") {
        const expire = new Date(Date.now() + this.sessionOptions.maxAge * 1000);
        await this.adapter.createSession?.(user, token, expire);
      }

      cookies().set(this.sessionOptions.cookieName, token, {
        maxAge: this.sessionOptions.maxAge,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      return {
        status: "success",
        message: "You have successfully signed in.",
      } as const;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return {
          status: "error",
          error: error.message,
        } as const;
      }
      // Handle signin errors
      console.error(error);
      return {
        status: "error",
        error: "An error occurred while signing in. Please try again.",
      } as const;
    }
  };

  signOut = async () => {
    try {
      const token = extractToken();

      const payload = await decode(token, this.jwtSecret);

      if (this.sessionOptions.strategy === "session") {
        await this.adapter.destroySession?.(token);
      }

      cookies().delete(this.sessionOptions.cookieName);

      return {
        status: "success",
        message: "You have successfully signed out.",
      } as const;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        cookies().delete(this.sessionOptions.cookieName);
        redirect(this.pages.signin);
      }
      // Handle signout errors
      console.error(error);
      return {
        status: "error",
        error: "An error occurred while signing out. Please try again.",
      } as const;
    }
  };

  session = async () => {
    try {
      const token = extractToken();

      const payload = await decode(token, this.jwtSecret);

      let user: User | null = null;
      let session: Session | undefined;

      if (this.sessionOptions.strategy === "session") {
        const sessionWithUser = await this.adapter.getUserFromSession?.(token);

        if (!sessionWithUser) {
          throw new UnauthorizedError();
        }

        if (sessionWithUser.session.expires < new Date()) {
          throw new SessionExpiredError();
        }

        user = sessionWithUser.user;
        session = sessionWithUser.session;
      } else {
        user = await this.adapter.getUserByIdentifier(
          (payload as any)._identifier
        );
      }

      if (!user) {
        throw new UserNotFoundError();
      }

      let sessionPayload = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
      } as unknown as TSessionData;

      this?.callbacks?.session?.(user, session, sessionPayload);

      return {
        status: "success",
        data: sessionPayload,
      } as const;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        if (
          error instanceof SessionExpiredError ||
          error instanceof TokenExpiredError
        ) {
          cookies().delete(this.sessionOptions.cookieName);
        }
        return {
          status: "error",
          error: error.message,
        } as const;
      }
      // Handle session errors
      console.error(error);
      return {
        status: "error",
        error: "An error occurred while verifying your session.",
      } as const;
    }
  };
}

const extractToken = () => {
  const cookieName = AUTH_FLOW_SESSION_OPTIONS.cookieName;
  let token = cookies().get(cookieName)?.value;

  if (!token) {
    token = headers().get("Authorization")?.split(" ")[1];
  }

  if (!token) {
    throw new UnauthorizedError();
  }

  return token;
};

interface DefaultSessionData {
  email: string;
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  image: string | null | undefined;
}
