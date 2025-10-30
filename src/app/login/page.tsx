"use client";
import LoginForm from "@/src/components/login/register/LoginForm";
import Nav from "@/src/components/nav/Nav";
import Sidebar from "@/src/components/sidebar/Sidebar";

// ... y llama al botón así:

export const Login = () => {
  return (
    <div className="flex min-h-screen items-start justify-center bg-neutral-50 dark:bg-[#121212] py-20">
      <div className="flex w-full flex-col items-center justify-center">
        <Nav />
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
