import { PrismaClient } from "@prisma/client";
import { Adapter, User } from "./types";

const prisma = new PrismaClient();

// Replace with your actual database interaction logic
export class DatabaseAdapter implements Adapter {
  async createUser(user: any): Promise<User> {
    const newUser = await prisma.user.create({
      data: user,
    });

    return newUser;
  }

  async getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  // ... methods for session management
}
