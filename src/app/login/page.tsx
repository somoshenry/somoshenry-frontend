"use client";
import LoginForm from "@/components/login/register/LoginForm";
import Nav from "@/components/nav/Nav";
import Sidebar from "@/components/sidebar/Sidebar";

// ... y llama al botón así:

export const Login = () => {
  return (
    <div className="flex min-h-screen items-start justify-center bg-neutral-50 dark:bg-gray-900 py-20">
      <div className="flex w-full flex-col items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
