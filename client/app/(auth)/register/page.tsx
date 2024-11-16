import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import RegisterForm from "@/modules/auth/register.form";

export default function SignUpRoute() {
  return (
    <>
      <CardHeader>
        <CardTitle>Register</CardTitle>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </>
  );
}
