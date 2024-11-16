import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default function LoginForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          Please enter your email and password to login.
        </CardDescription>
      </CardContent>
      <CardFooter>{/* Add your login form here */}</CardFooter>
    </Card>
  );
}
