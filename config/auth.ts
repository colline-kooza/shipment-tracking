import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/prisma/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jb@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw { error: "No Inputs Found", status: 401 };
          }

          const existingUser = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!existingUser) {
            console.log("No user found");
            throw { error: "No user found", status: 404 };
          }
          if (!existingUser.isVerfied) {
            console.log("User Not Verified");
            throw { error: "User Not Verified", status: 401 };
          }

          let passwordMatch: boolean = false;
          if (existingUser && existingUser.password) {
            passwordMatch = await compare(
              credentials.password,
              existingUser.password
            );
          }
          if (!passwordMatch) {
            throw { error: "Password Incorrect", status: 401 };
          }

          const user = {
            id: existingUser.id,
            name: existingUser.name,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            phone: existingUser.phone,
            image: existingUser.image,
            email: existingUser.email,
            role: existingUser.role,
            orgId: existingUser?.orgId ?? "",
            orgName: existingUser?.orgName ?? "",
          };

          return user;
        } catch (error) {
          throw { error: "Something went wrong", status: 401 };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // If this is a new sign-in, populate the token with user data
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.orgId = user.orgId;
        token.orgName = user.orgName;
      }

      // If the session is being updated, fetch fresh user data
      if (trigger === "update" && token.id) {
        try {
          const freshUser = await db.user.findUnique({
            where: { id: token.id },
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true,
              image: true,
              role: true,
              phone: true,
              orgId: true,
              orgName: true,
            },
          });

          if (freshUser) {
            token.id = freshUser.id;
            token.name = freshUser.name;
            token.email = freshUser.email;
            token.picture = freshUser.image;
            token.role = freshUser.role;
            token.firstName = freshUser.firstName;
            token.lastName = freshUser.lastName;
            token.phone = freshUser.phone;
            token.orgId = freshUser.orgId ?? "";
            token.orgName = freshUser.orgName ?? "";
          }
        } catch (error) {
          console.error("Error fetching fresh user data:", error);
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.phone = token.phone;
        session.user.orgId = token.orgId;
        session.user.orgName = token.orgName;
      }
      return session;
    },
  },
};
