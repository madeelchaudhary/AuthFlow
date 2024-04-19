"use server";

import AuthFlow from ".";
import { DatabaseAdapter } from "./database.adatpter";

export const { signIn, signUp, signOut, session } = new AuthFlow({
  adapter: new DatabaseAdapter(),
  callbacks: {
    session(user, session) {
      return user;
    },
  },
});
