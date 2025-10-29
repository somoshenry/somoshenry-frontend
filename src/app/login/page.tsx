import LoginForm from "@/src/components/LoginForm";
import React from "react";

export const Login = () => {
  return (
    <div className="flex min-h-screen items-start justify-center bg-neutral-50 py-20">
      <div className="flex w-full flex-col items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
