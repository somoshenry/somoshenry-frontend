"use client";
import Link from "next/link";
import {useState} from "react";
import * as Yup from "yup";
import {ValidationError} from "yup";
import Swal from "sweetalert2";
import ImputGeneric from "./ImputGeneric";
import ButtonForm from "./ButtonForm";
import ILoginFormProps from "@/src/interfaces/ILoginFormProps";
import useDarkMode from "@/src/hook/useDarkMode";

const LoginForm = () => {
  const [error, setError] = useState<Record<string, string[]>>({});
  const [loginformstate, setloginformstate] = useState<ILoginFormProps>({
    email: "",
    password: "",
  });

  const loginValidateSchema = Yup.object({
    email: Yup.string().required("El email es requerida"),
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
        console.log("Errores recopilados por Yup:", newError);
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

  const submitHandel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const Valid = await validateLogin(loginformstate);
    if (Valid) {
      Swal.fire("Todo bien!");
    } else {
      Swal.fire("Todo mal!");
    }
  };

  return (
    <form
      className="shadow-Oscuro border-[#ffff00] mx-auto flex w-11/12 max-w-md min-w-[400px] flex-col bg-gray-100 items-center rounded-xl border-t-4  m-8 shadow-2xl "
      onSubmit={submitHandel}
    >
      <div className=" flex flex-col justify-center text-center rounded-t-xl pt-10 w-full ">
        <img src="/user.png" className="size-16 mx-auto block mb-2" />
        <p className="text-3xl text-black mb-2">Bienvenido de nuevo</p>
        <p className="text-md text-gray-700 mb-6">Inicia sesión en tu cuenta</p>
      </div>
      <div className=" p-10 border rounded-xl bg-white w-full">
        <ImputGeneric
          id="email"
          label="Email"
          type="text"
          value={loginformstate.email}
          name="email"
          onChange={changeHandler}
        />
        {error.email && <div className="text-red-400 mb-3 text-sm">{error.email}</div>}
        <ImputGeneric
          id="password"
          type="password"
          label="Contraseña"
          value={loginformstate.password}
          name="password"
          onChange={changeHandler}
        />
        {error.password && <div className="text-red-400 mb-1 text-sm">{error.password}</div>}

        <div className="flex justify-end w-full mb-6">
          <Link
            href="/register"
            className="text-blue-500 text-sm duration-150 hover:scale-[1.02] hover:underline hover:rounded-full"
          >
            ¿Olvidades tu contraseña?
          </Link>
        </div>
        <ButtonForm name="Entrar" type="submit" />
        <div className="flex justify-center w-full mt-4">
          <Link href="/register" className="text-blue-500 mb-6 text-sm duration-150 hover:scale-[1.02] hover:underline">
            ¿No tienes cuenta? Crear cuenta
          </Link>
        </div>
      </div>
    </form>
  );
};
export default LoginForm;
