import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import RegisterForm from "@/modules/auth/register.form";
import Link from "next/link";

export default function SignUpRoute() {
  return (
    <>
      <CardHeader>
        <CardTitle>Register</CardTitle>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <p className="font-medium mt-4 text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className=" text-blue-600 underline dark:text-blue-500 hover:no-underline"
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </>
  );
}
