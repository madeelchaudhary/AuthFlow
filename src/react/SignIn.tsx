"use client";
import { Button } from "@/src/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import AuthFlow from "@/src/auth-flow";
import { SignInSchema } from "@/src/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as React from "react";

interface Props {
  signIn: typeof AuthFlow.prototype.signIn;
  pages?: {
    signup?: string;
    redirectAfterSignIn?: string;
  };
}

const SignIn = ({ signIn, pages }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const signUpPage = pages?.signup || "/signup";
  const redirectAfterSignIn = pages?.redirectAfterSignIn || "/";

  const { push } = useRouter();

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof SignInSchema>) => {
    setIsLoading(true);

    const res = await signIn(values);

    if (res.status === "error") {
      setError(res.error);
      setIsLoading(false);
      return;
    }

    push(redirectAfterSignIn);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="container mx-auto flex-grow flex items-center justify-center">
        <div className="w-full bg-white shadow-xl p-8 md:p-16 rounded-xl max-w-sm md:max-w-md lg:max-w-lg">
          <div className="text-center mb-4">
            <h2 className="font-semibold text-2xl mb-1">Sign In</h2>
            <p className="text-gray-500 text-sm font-normal">
              Welcome back! 👋
            </p>
          </div>

          <Form {...form}>
            <form
              className="py-4 space-y-5 w-full"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <Button
                type="submit"
                variant="secondary"
                className="bg-black text-white w-full hover:text-black focus:ring-4 focus:outline-none font-medium rounded-lg px-5 py-2.5 text-center flex justify-center items-center transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}{" "}
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link className="text-blue-400 hover:underline" href={signUpPage}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
