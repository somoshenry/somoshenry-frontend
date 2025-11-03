import RegisterForm from "@/components/login/register/RegisterForm";

export const Register = () => {
  return (
    <div className="flex min-h-screen items-start justify-center bg-neutral-50 dark:bg-gray-900 py-20">
      <div className="flex w-full flex-col items-center justify-center">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
