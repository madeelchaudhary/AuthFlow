"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AuthFlow from "@/lib";
import { SignUpSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AUTH_FLOW_PAGES } from "@/lib/constants";

interface Props {
  signUp: typeof AuthFlow.prototype.signUp;
}

const Signup = ({ signUp }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { push } = useRouter();

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof SignUpSchema>) => {
    setIsLoading(true);
    setError(null);

    const res = await signUp(values);

    if (res.status === "success") {
      setMessage(res.message);
      setIsLoading(false);
      setTimeout(() => {
        push(AUTH_FLOW_PAGES.signin);
      }, 500);
      return;
    }

    if (res.status === "error") {
      setError(res.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="container mx-auto flex-grow flex items-center justify-center">
        <div className="w-full bg-white shadow-xl p-8 md:p-16 rounded-xl max-w-sm md:max-w-md lg:max-w-lg">
          <div className="text-center mb-4">
            <h2 className="font-semibold text-2xl mb-1">Sign Up</h2>
            <p className="text-gray-500 text-sm font-normal">
              Be part of our community 🎉
            </p>
          </div>

          {message && (
            <p className="text-green-500 text-sm text-center">{message}</p>
          )}

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
                    <FormDescription>
                      Password must be at least 8 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        {...field}
                      />
                    </FormControl>
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
                {isLoading ? "Signing Up..." : "Sign Up"}{" "}
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              className="text-blue-400 hover:underline"
              href={AUTH_FLOW_PAGES.signin}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
