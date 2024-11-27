"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { API_URL } from "@/config";
import { useState } from "react";
import AsyncButton from "@/modules/core/async-button";

const formSchema = z
  .object({
    email: z.string().email({
      message: "Invalid email format"
    }),
    username: z.string().min(4, {
      message: "Username should be at least 6 characters long"
    }),
    password: z.string().min(8, {
      message: "Password should be at least 8 characters long"
    }),
    confirmPassword: z.string().min(8, {
      message: "Password should be at least 8 characters long"
    })
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"]
      });
    }
  });

export default function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingState, setLoadingState] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoadingState(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: values.email,
          username: values.username,
          password: values.password
        })
      });
      if (res.ok) {
        toast({
          title: "Success",
          description: "New User has been registered.",
          duration: 3000
        });
        router.push("/auth/login");
      } else if (res.status === 409) {
        toast({
          variant: "destructive",
          title: "Conflict Error  ",
          description: "That email is already being used by another user",
          duration: 3000
        });
      } else if ([400, 401, 403, 404].includes(res.status)) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Invalid username or password",
          duration: 3000
        });
      } else {
        toast({
          variant: "destructive",
          title: "Oh no! Something went wrong",
          description: "The server ran into an error",
          duration: 3000
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Could not connect to the server",
          description:
            error.message + ". Please check your internet connection",
          duration: 2000
        });
      }
    }
    setLoadingState(false);
  };
  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="text-left">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="text-left">
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="text-left">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="text-left">
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <AsyncButton isLoading={loadingState} type="submit" text="Register" />
      </form>
    </Form>
  );
}
