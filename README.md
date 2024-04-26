# AuthFlow Next [![npm version](https://badge.fury.io/js/authflow-next.svg)](https://badge.fury.io/js/authflow-next)

Streamlines authentication workflows within your Next.js applications. It provides a flexible API that works with any Database and ORM, offering both JWT and session-based authentication strategies.

- **Flexible API**: Works with any Database and ORM.
- **JWT and Session-based Authentication**: Choose between JWT and session-based authentication strategies.
- **Unopinionated**: No assumptions about your project structure or UI components.
- **Typescript Support**: Written in Typescript with full type definitions.
- **Easy to Use**: Use as server actions or inside your Route Handlers.
- **Customizable**: Customize the authentication flow to fit your needs.
- **Components and Hooks**: Built-in components and hooks to speed up development.

## Installation

```bash
npm install authflow-next

# or
yarn add authflow-next

# or
pnpm add authflow-next
```

## Getting Started

To get started, you need to create a new instance of the `AuthFlow` class and pass in your configuration options. Here's an example:

```ts
import { AuthFlow } from 'authflow-next'
import { AuthConfig } from 'authflow-next/types'

const config: AuthConfig = {} // Your configuration options

const { signIn, signUp, signOut, session } = new AuthFlow(config)
```

## Configuration Options

The `AuthFlow` class accepts the following configuration options

| Option       | Type                     | Description                                                 | Default          | Required |
| ------------ | ------------------------ | ----------------------------------------------------------- | ---------------- | -------- |
| `jwtSecret`  | `string`                 | The secret key used to sign JWT tokens.                     | Insecure         | Yes      |
| `identifier` | `string` or `number`     | Identifier field used for user (e.g., email, ID)            | `email`          | No       |
| `session`    | `Partial<SessionOptions> | Sessions options configuration                              | (default values) | No       |
| `adapter`    | `Adapter`                | Database adapter object iplementing the `Adapter` interface | (none)           | Yes      |
| `schema`     | Explained                | Validation schema for signup and login fields               | (default values) | No       |
| `callbacks`  | `Partial<Callbacks>`     | Callback functions for JWT generation and session handling  | (none)           | No       |
| `pages`      | `Partial<Pages>`         | URLs for signin and signup pages                            | (default values) | No       |

## Usage

`authflow-next` provides a set of methods to handle authentication workflows. Here's a list of available methods:

- `signIn`: Sign in a user.
- `signUp`: Sign up a new user.
- `signOut`: Sign out a user.
- `session`: Get the current user session.

All methods can be used as server actions or inside your route handlers. It's up to you to decide how to use them.

> **Note**: The components and hooks provided by `authflow-next` are built on top of these methods. You can use them directly or create your own custom components.

> **Note**: By default, `authflow-next` uses the email field as the user identifier. You can customize this by setting the `identifier` option in the configuration object.

### Sign In

The `signIn` method is used to authenticate a user. It accepts an object with the user's credentials (e.g., email and password) and generates a JWT token if the credentials are valid. You can use `jwt` callbacks to customize the token payload.

You can customize the credentials fields and make sure they match your schema by setting the `schema` option in the configuration object.

### Sign Up

The `signUp` method is used to create a new user. It accepts an object with the user's information (e.g., email and password) and creates a new user in the database. You can customize the fields and make sure they match your schema by setting the `schema` option in the configuration object.

### Sign Out

The `signOut` method is used to sign out a user. It invalidates the user's session and logs them out.

### Get Session

The `session` method is used to get the current user session. It returns the user object if the user is authenticated or provides an error message if the user is not authenticated. `session` can be used inside your route handlers, server actions, or server components.

You can use `session` callbacks to customize the session data. For example, you can add custom fields to the session object or modify the user object before returning it. To get proper type hints, you can pass the return type as a generic type parameter to the `AuthFlow` class.

## Authentication Strategies

`authflow-next` supports two authentication strategies: JWT and session-based authentication. You can choose between them by setting the `session` option in the configuration object.

### JWT Authentication

JWT authentication is a stateless authentication strategy that uses JSON Web Tokens to authenticate users.

### Session-based Authentication

Session-based authentication maintains user information on the server-side.

## Adapter Integration

`authflow-next` requires a database adapter to interact with your chosen database and ORM. This adapter object implements the `Adapter` interface, defining methods for user management and session handling. Check the [Custom Adapters](#custom-adapters) section for more information.

## Protecting Routes

`authflow-next` provides two powerful middleware functions to secure your application's routes:

### `withAuth` Middleware

This middleware verifies user authentication and controls access based on defined rules.

It accepts two arguments:

- `options`: An object containing:
  - config: The AuthConfig object used to configure authflow-next.
  - pages (optional): An object specifying public pages, error pages, and redirect behaviors.
- `handler` (optional): A function to be executed after successful authentication or for public pages. It receives the request, response, and authenticated user object as arguments.

How it Works:

1. The middleware checks if the requested URL is defined as a public page (in the pages configuration).
2. If not a public page, it attempts to verify the user's authentication using the configured strategy (JWT or session).
3. If the user is authenticated, the handler function (if provided) is called, allowing you to handle authenticated requests.
4. If user authentication fails or the page requires authentication, the middleware can handle the situation in various ways depending on your configuration:
   - Redirect to a login page.
   - Redirect to an error page.

### `withAuthEdge` Middleware

This middleware is similar to `withAuth` but is designed for edge functions in Vercel. It works the same way as `withAuth` but is optimized for edge functions.

It verifies the JWT token sent in the request header and calls the handler with the decoded payload if valid.

## Managing Session State

The `SessionProvider` component is used to manage the session state in your application. It wraps all child components that require access to the session data.

The `SessionProvider` component accepts the following props:

- `children`: The child components that require access to the session data.
- `session`: The session method from the `AuthFlow` instance.
- `sessionTimeout`: The session timeout in milliseconds. The default value is 5 minutes.

```ts
import { SessionProvider } from 'authflow-next/react';

export default function Layout ({ children }) {

  return (
    <SessionProvider session={authflow.session}>
      {children}
    </SessionProvider>
  );
}
```

## Accessing Session Data

The `useSession` hook is used to access the session data in your components. It's designed to be used inside components wrapped by the `SessionProvider`.

The `useSession` hook returns an object with the following properties:

- `status`: Reflects the current session state ("loading," "authenticated," or "unauthenticated").
- `data`: Holds the user's session data (null if unauthenticated, undefined while loading, and actual data object when authenticated).

```ts
import { useSession } from 'authflow-next/react';

export default function Profile() {
  const { status, data } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>You are not authenticated.</p>;
  }

  return <p>Welcome, {data?.name}!</p>;
}
```

## Authentication Components

`authflow-next` provides two pre-built components to streamline your authentication flow:

### `SignIn`

This component renders a login form that allows users to submit their credentials for authentication.

The `SignIn` component accepts the following props:

`signIn`: A reference to the `authflow-next` `signIn` method for user login.
`pages` (optional): An object defining URLs for signup and redirect after successful login.
`schema` (optional): A validation schema for the login form fields.
`fields` (optional): An array of field objects defining the login form structure (name, label, type, etc.).
Class names for various form elements (wrapper, form, and button)

### `SignUp`

This component renders a registration form that allows users to create a new account. It has props similar to SignIn but accepts a signUp method for user registration.

> **Note**: Make sure to import the css file from `authflow-next/index.css` to style the components. You can import it in your main layout file or in your component.

## Custom Adapters

Define a custom adapter to interact with your chosen database and ORM. The adapter object must implement the `Adapter` interface, which defines methods for user management and session handling.

Implement the following methods in your custom adapter:
`getUserByIdentifier(identifier: string | number)`: Retrieves a user by their identifier (e.g., email) from the database.
`createUser(user: Omit<User, "id">)`: Creates a new user record in the database.
`(Optional) createSession(user: User, sessionToken: string, expiresIn: Date)`: Creates a session for a user (if session strategy is used).
`(Optional) destroySession(sessionToken: string)`: Destroys a session (if session strategy is used).
`(Optional) getUserFromSession(sessionToken: string)`: Retrieves a user associated with a session token (if session strategy is used).

> **Note**: I'm working on adapters for popular databases and ORMs. Stay tuned for updates!

## Conclusion

`authflow-next` is a flexible and unopinionated library that streamlines authentication workflows in your Next.js applications. It provides a powerful API that works with any Database and ORM, offering both JWT and session-based authentication strategies.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.
