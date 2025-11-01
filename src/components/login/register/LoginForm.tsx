"use client";
import Link from "next/link";
import {useState} from "react";
import * as Yup from "yup";
import {ValidationError} from "yup";
import Swal from "sweetalert2";
import ImputGeneric from "./ImputGeneric";
import ButtonForm from "./ButtonForm";
import ILoginFormProps from "@/interfaces/ILoginFormProps";
import {useRouter} from "next/navigation";
import {useAuth} from "@/hook/useAuth";
import axios from "axios";
import "../../../app/globals.css";

const LoginForm = () => {
  const [error, setError] = useState<Record<string, string[]>>({});
  const [loginformstate, setloginformstate] = useState<ILoginFormProps>({
    email: "",
    password: "",
  });

  const router = useRouter();
  const {login} = useAuth();

  const loginValidateSchema = Yup.object({
    email: Yup.string().required("El email es requerido").email("Debe ser un email válido"),
    password: Yup.string().required("La contraseña es requerida"),
  });

  const validateLogin = async (data: ILoginFormProps): Promise<boolean> => {
    try {
      await loginValidateSchema.validate(data, {abortEarly: false});
      setError({});
      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        const newError: Record<string, string[]> = {};

        for (const err of error.inner) {
          const fieldName = err.path || "unknown";
          const fieldError = err.message;

          if (!newError[fieldName]) {
            newError[fieldName] = [];
          }
          newError[fieldName].push(fieldError);
        }
        setError(newError);
        return false;
      }
      return false;
    }
  };

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setloginformstate({...loginformstate, [name]: value});
  };

  //const handleLogin = () => {
  // window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  //};

  const submitHandel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const valid = await validateLogin(loginformstate);

    if (valid) {
      try {
        await login(loginformstate.email, loginformstate.password);

        await Swal.fire({
          icon: "success",
          title: "¡Bienvenido!",
          text: "Has iniciado sesión correctamente",
          timer: 2000,
          showConfirmButton: false,
        });

        router.push("/home");
      } catch (error) {
        let errorMessage = "Ocurrio un error durante el login";

        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || errorMessage;
        }
        await Swal.fire({
          icon: "error",
          title: "Error al iniciar sesión",
          text: errorMessage,
        });
      }
    }
  };

  return (
    <>
      <form
        className="shadow-Oscuro border-[#ffff00] mx-auto dark:bg-gray-100 flex w-11/12 max-w-md min-w-[400px] flex-col bg-gray-100 items-center rounded-xl border-t-4 m-8 shadow-2xl"
        onSubmit={submitHandel}
        noValidate
      >
        <div className="flex flex-col justify-center text-center border-t-xl pt-10 w-full">
          <img src="/user.png" className="size-16 mx-auto block mb-2" alt="Usuario" />
          <p className="text-3xl text-black mb-2">Bienvenido de nuevo</p>
          <p className="text-md text-gray-500 mb-6">Inicia sesión en tu cuenta</p>
        </div>
        <div className="p-10 rounded-xl dark:bg-gray-200  bg-white w-full">
          <ImputGeneric
            id="email"
            label="Email"
            type="email"
            value={loginformstate.email}
            name="email"
            onChange={changeHandler}
          />
          {error.email && <div className="text-red-400 mb-3 text-xs">*{error.email}</div>}
          <ImputGeneric
            id="password"
            type="password"
            label="Contraseña"
            value={loginformstate.password}
            name="password"
            onChange={changeHandler}
          />
          {error.password && <div className="text-red-400 mb-1 text-xs">*{error.password}</div>}
          <div className="flex justify-end w-full mb-6">
            <Link
              href="/forgot-password"
              className="text-blue-500 text-sm duration-150 hover:scale-[1.02] hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <ButtonForm name="Entrar" type="submit" />

          <div className="flex justify-center w-full mt-4">
            <Link
              href="/register"
              className="text-blue-500 mb-6 text-sm duration-150 hover:scale-[1.02] hover:underline"
            >
              ¿No tienes cuenta? Crear cuenta
            </Link>
          </div>

          <div className="flex justify-center w-full">
            <Link
              className="bg-white w-full text-center hover:shadow-black text-md mt-2 transform cursor-pointer rounded-lg py-1 text-black shadow-sm/30 duration-300 hover:scale-105 hover:rainbow-shadow-hover"
              href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
            >
              Inicia sesión con Google
            </Link>
          </div>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
