"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import AsyncButton from "@/components/custom-components/async-button";
import { createSession } from "@/app/lib/session";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/config";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email format"
  }),
  password: z.string().min(8, {
    message: "Password should be at least 8 characters long"
  })
});

export default function LoginForm() {
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
    try {
      setLoadingState(true);
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password
        })
      });
      if (res.ok) {
        toast({
          title: "Success",
          description: "Logged in.",
          duration: 3000
        });
        const resData: {
          token: string;
          email: string;
          username: string;
        } = await res.json();
        await createSession(resData.token);
      } else {
        const resData = await res.json();
        throw new Error(resData.error || "Could not Login");
      }
      setLoadingState(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error.message,
          duration: 2000
        });
      }
      setLoadingState(false);
    }
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
                <Input {...field} />
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <AsyncButton isLoading={loadingState} type="submit" text="Login" />
      </form>
    </Form>
  );
}