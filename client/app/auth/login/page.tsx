import LoginForm from "@/modules/auth/login.form";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SignInRoute() {
  return (
    <>
      <CardHeader>
        <CardTitle>Log In</CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <p className="font-medium mt-4 text-gray-500 dark:text-gray-400">
          {"Don't have an account? "}
          <Link
            href="/auth/register"
            className=" text-blue-600 underline dark:text-blue-500 hover:no-underline"
          >
            Register
          </Link>
        </p>
      </CardContent>
    </>
  );
}
