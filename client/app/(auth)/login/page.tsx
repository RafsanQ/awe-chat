import LoginForm from "@/modules/auth/login.form";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInRoute() {
  return (
    <>
      <CardHeader>
        <CardTitle>Log In</CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </>
  );
}
