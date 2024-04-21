import { z } from "zod";

interface SessionWithUser {
  session: Session;
  user: User;
}

export interface Adapter {
  /**
   * The getUserByIdentifier method retrieves a user by identifier from the database.
   *
   * @param identifier - A string or number representing the identifier of the user.
   * @returns A Promise that resolves to a User object representing the user. If the user does not exist, the method should return null.
   * @example
   * ```typescript
   * const user = await adapter.getUserByIdentifier("[email protected]");
   * ```
   */
  getUserByIdentifier(identifier: string | number): Promise<User | null>;

  /**
   * The createUser method creates a user record in the database.
   * @param user - An object containing the credentials of the user. The object must contain the email and password properties.
   * @returns A Promise that resolves to a User object representing the created user.
   * @example
   * ```typescript
   * const user = await adapter.createUser({
   *  email: "[email protected]",
   *  hashedPassword: "hashedPassword",
   * });
   * ```
   */
  createUser(user: Omit<User, "id">): Promise<User>;

  /**
   * The createSession method creates a session for a user.
   * @param user - A User object representing the user.
   * @param sessionToken - A string representing the session token.
   * @param expiresIn - A Date object representing the expiration date of the session.
   * @returns A Promise that resolves to a SessionWithUser object representing the session and user.
   * @example
   * ```typescript
   * const session = await adapter.createSession(user, "sessionToken", new Date());
   * ```
   * @remarks
   * This method is optional and is only required if the session strategy is used.
   *
   * If the session strategy is used, the createSession method must be implemented to create a session for the user.
   *
   * The createSession method should store the session token and expiration date in the database.
   */
  createSession?(
    user: User,
    sessionToken: string,
    expiresIn: Date
  ): Promise<SessionWithUser>;

  /**
   * The destroySession method destroys a session.
   * @param sessionToken - A string representing the session token.
   * @returns A Promise that resolves when the session is destroyed.
   * @example
   * ```typescript
   * await adapter.destroySession("sessionToken");
   * ```
   * @remarks
   * This method is optional and is only required if the session strategy is used.
   *
   * If the session strategy is used, the destroySession method must be implemented to destroy the session.
   *
   * The destroySession method should remove the session from the database.
   */
  destroySession?(sessionToken: string): Promise<void>;

  /**
   * The getUserFromSession method retrieves a user from a session.
   * @param sessionToken - A string representing the session token.
   * @returns A Promise that resolves to a SessionWithUser object representing the session and user.
   * @example
   * ```typescript
   * const session = await adapter.getUserFromSession("sessionToken");
   * ```
   * @remarks
   * This method is optional and is only required if the session strategy is used.
   *
   * If the session strategy is used, the getUserFromSession method must be implemented to retrieve the user from the session.
   *
   * The getUserFromSession method should retrieve the session from the database and return the user associated with the session.
   */
  getUserFromSession?(sessionToken: string): Promise<SessionWithUser>;
}

interface AuthConfigBase {
  /**
   * The jwtSecret property specifies the secret key used to sign the JWT token.
   *
   * The jwtSecret property is a string representing the secret key used to sign the JWT token. The secret key should be a random string of characters.
   *
   * @remarks
   * The jwtSecret property is required to sign the JWT token. If the jwtSecret property is not provided, a default secret key is used. It is recommended to provide a custom secret key for security reasons.
   *
   * Here is an example of generating a random secret key using the OpenSSL command-line tool:
   * ```bash
   *    openssl rand -base64 32
   * ```
   */
  jwtSecret?: string;

  /**
   * The identifier property specifies the identifier of the user.
   *
   * The identifier property is a string or number representing the identifier of the user. The identifier is used to uniquely identify the user in the database.
   *
   * @default "email" - The default identifier is the email address of the user.
   *
   * @remarks
   * The identifier property is required to identify the user in the database. The identifier should be unique and should not change over time.
   *
   * The identifier property is used to retrieve the user from the database and to create a session for the user.
   */
  identifier?: string | number;

  /**
   * The SessionOptions interface defines the properties of the session options object.
   *
   * The SessionOptions interface has the following properties:
   * @param strategy - A string representing the authentication strategy to use.
   * @param cookieName - A string representing the name of the cookie that stores the session token.
   * @param maxAge - A number representing the maximum age of the session token in seconds.
   */
  session?: Partial<SessionOptions>;

  /**
   * The adapter property specifies the database adapter to use for interacting with the database.
   *
   * The adapter property is an object that implements the Adapter interface.
   *
   * # @remarks
   *  The adapter property is required to interact with the database. The adapter object must implement the methods defined in the Adapter interface.
   *
   * _The Adapter interface defines the methods for interacting with the database. The methods include createUser, getUserByEmail, createSession, destroySession, and getUserFromSession._
   *
   * The createUser method creates a user record in the database.
   * The getUserByEmail method retrieves a user by email from the database.
   * The createSession method creates a session for a user.
   * The destroySession method destroys a session.
   * The getUserFromSession method retrieves a user from a session.
   *
   * The adapter object must implement the createUser and getUserByEmail methods. The createSession, destroySession, and getUserFromSession methods are optional and are only required if the session strategy is used.
   *
   */
  adapter: Adapter;

  schema?: {
    signup?: {
      /**
       * The validationSchema property specifies the validation schema for the signup form.
       *
       * The validationSchema property is a Zod schema that defines the shape of the signup form data. The validation schema is used to validate the user input before creating a new account.
       *
       * @remarks
       * The validationSchema property is required to validate the user input. The validation schema should include the required fields for creating a new account, such as email and password.
       *
       * If the validation schema is not provided, a default schema is used. It is recommended to provide a custom validation schema to match the requirements of the application.
       *
       * Custom validation schemas must match the shape of the default schema. The default schema includes the email and password fields.
       *
       */
      validationSchema: SignUpBaseSchema;
    };
    login?: {
      /**
       * The validationSchema property specifies the validation schema for the login form.
       *
       * The validationSchema property is a Zod schema that defines the shape of the login form data. The validation schema is used to validate the user input before authenticating the user.
       *
       * @remarks
       * The validationSchema property is required to validate the user input. The validation schema should include the required fields for authenticating the user, such as email and password.
       *
       * If the validation schema is not provided, a default schema is used. It is recommended to provide a custom validation schema to match the requirements of the application.
       *
       * Custom validation schemas must match the shape of the default schema. The default schema includes the email and password fields.
       *
       */
      validationSchema: SignInBaseSchema;
    };
  };

  /**
   * The callbacks property is an object that contains the callback functions to execute after successful authentication. The callbacks object can contain the jwt and session properties.
   *
   * @param jwt - A function that is called right before the JWT token is generated. The function receives the user object and the token as arguments. The function can be used to add custom claims to the token.
   *
   * @param session - A function that is called before the session is returned to the client. The function receives the user object, the session object, and the payload as arguments. The function can be used to add custom data to the session object.
   *
   */
  callbacks?: {
    /**
     * The jwt property specifies a function that is called right before the JWT token is generated. The function receives the user object and the token as arguments. The function can be used to add custom claims to the token.
     *
     * @param user - A User object representing the user.
     * @param token - A string representing the JWT token.
     *
     */
    jwt?(user: User, token: any): void;

    /**
     * The session property specifies a function that is called before the session is returned to the client. The function receives the user object, the session object, and the payload as arguments. The function can be used to add custom data to the session object.
     *
     * @param user - A User object representing the user.
     * @param session - A Session object representing the session.
     * @param payload - An object containing the payload data.
     *
     * @remarks
     * You can use the session callback to add custom data to the session object before it is returned to the client. For example, you can add the user's role or permissions to the session object.
     */
    session?(
      user: User,
      session: Session | undefined,
      payload: Record<string, any>
    ): void;
  };

  /**
   * The pages property specifies the URLs of the signin and signup pages.
   *
   * @param signin - A string representing the URL of the signin page.
   * @param signup - A string representing the URL of the signup page.
   *
   * @remarks
   * The pages property is an object that contains the URLs of the signin and signup pages. The signin and signup pages are used to authenticate users and create new accounts, respectively.
   */
  pages?: Partial<AuthPages>;
}

export type AuthConfig = AuthConfigBase;

export type SignUpBaseSchema = z.ZodType<{
  email: string;
  password: string;
  [k: string]: any;
}>;

export type SignInBaseSchema = z.ZodType<{
  email: string;
  password: string;
  [k: string]: any;
}>;

/*
 * The Session interface defines the properties of a session object.
 *
 * The Session interface has the following properties:
 * @params id - A string representing the session ID.
 * @param userId - A string representing the user ID.
 * @param expires - A Date object representing the expiration date of the session.
 * @param accessToken - A string representing the access token.
 */
export interface Session {
  id: string;
  userId: string;
  expires: Date;
  accessToken: string;
  [key: string]: any;
}

export interface SessionOptions {
  /**
   * The strategy property specifies the authentication strategy to use.
   *
   * The strategy property is a string that can have one of the following values:
   * - jwt: The JWT strategy is used for authentication. JWT is a stateless authentication mechanism that uses JSON Web Tokens. The JWT strategy is the default strategy.
   * - session: The session strategy is used for authentication. The session strategy is a stateful authentication mechanism that uses sessions and cookies.
   */
  strategy: "jwt" | "session";

  /**
   * The cookieName property specifies the name of the cookie that stores the session token.
   *
   * The cookieName property is a string that represents the name of the cookie that stores the session token. The default value is "auth_flow.session-token".
   */
  cookieName: string;

  /**
   * The maxAge property specifies the maximum age of the session token.
   *
   * The maxAge property is a number that represents the maximum age of the session token in seconds. The default value is ```60 * 60 * 24 * 30```, which is equivalent to 30 days.
   */
  maxAge: number;
}

export interface AuthPages {
  /**
   * The signin property specifies the URL of the login page. A user is redirected to the login page if they are not authenticated.
   *
   * @default "/signin"
   */
  signin: string;

  /**
   * The signup property specifies the URL of the signup page. A user is redirected to the signup page if they do not have an account.
   *
   * @default "/signup"
   */
  signup: string;
}

export interface User {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  hashedPassword: string;
  image?: string | null;
  status?: string | null;
  [key: string]: any;
}
