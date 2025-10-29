"use client";

import {useState} from "react";
import ButtonForm from "./ButtonForm";
import {useRouter} from "next/navigation";
import * as Yup from "yup";
import {ValidationError} from "yup";
import Swal from "sweetalert2";
import ImputGeneric from "./ImputGeneric";
import IRegisterFormProps from "../interfaces/IRegisterFormProps";
import Link from "next/link";

export const RegisterForm = () => {
  const [error, setError] = useState<Record<string, string[]>>({});
  const [registerstate, setregisterstate] = useState<IRegisterFormProps>({
    name: "",
    lastName: "",
    email: "",
    password: "",
    confPassword: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    lastName: false,
    email: false,
    password: false,
    confPassword: false,
  });

  const router = useRouter();

  let registerValidateSchema = Yup.object({
    name: Yup.string().required("El nombre es requerido.").trim(),

    // Corregido: 'apellido' no existe en 'registerstate', debe ser 'lastName'
    lastName: Yup.string().required("El apellido es requerido.").trim(),

    email: Yup.string().required("El email es requerido.").email("Debe ser un email valido"),

    password: Yup.string().required("La contraseña es requerida."),

    confPassword: Yup.string()
      .required("La confirmación es requerida.")
      .oneOf([Yup.ref("password")], "Las contraseñas no coinciden."),
  });

  const validateRegister = async (data: IRegisterFormProps): Promise<boolean> => {
    try {
      await registerValidateSchema.validate(data, {abortEarly: false});
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
    setregisterstate({...registerstate, [name]: value});
  };

  const handleBlur = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name} = e.target;

    setTouched({...touched, [name]: true});

    try {
      await registerValidateSchema.validateAt(name, registerstate);

      setError((prevErrors) => {
        const newErrors = {...prevErrors};
        delete newErrors[name];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        setError((prevErrors) => ({
          ...prevErrors,
          [name]: error.errors,
        }));
      }
    }
  };

  const submitHandel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const valid = await validateRegister(registerstate);

    if (valid) {
      Swal.fire("Todo bien!");
      router.push("/login");
    } else {
      Swal.fire("Todo mal!");
    }
  };

  return (
    <form
      className="shadow-Oscuro border-[#ffff00] mx-auto flex w-11/12 max-w-md min-w-[400px] flex-col bg-gray-100 items-center rounded-xl border-t-4 m-8 shadow-2xl"
      onSubmit={submitHandel}
      noValidate
    >
      <div className=" flex flex-col justify-center text-center pt-10 pb-4 w-full ">
        <img src="/user.png" className="size-16 mx-auto block mb-2" />
        <p className="text-3xl text-black mb-2">Crear cuenta</p>
        <p className="text-md text-gray-700">Únete a somosHenry</p>
      </div>
      <div className="p-10 bg-white w-full rounded-xl">
        <div className="flex w-full space-x-4">
          <div className="flex flex-col w-1/2">
            <ImputGeneric
              id="name"
              label="Nombre"
              name="name"
              value={registerstate.name}
              onChange={changeHandler}
              onBlur={handleBlur}
            />
            {Array.isArray(error.name) && error.name.length > 0 && (
              <div className="text-red-400 mb-3 space-y-1 text-sm w-full">
                {error.name.map((message, index) => (
                  <p key={index} className="flex items-start">
                    {message}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col w-1/2">
            <ImputGeneric
              id="lastName"
              label="Apellido"
              name="lastName"
              value={registerstate.lastName}
              onChange={changeHandler}
              onBlur={handleBlur}
            />

            {Array.isArray(error.lastName) && error.lastName.length > 0 && (
              <div className="text-red-400 mb-3 space-y-1 text-sm w-full">
                {error.lastName.map((message, index) => (
                  <p key={index} className="flex items-start">
                    {message}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <ImputGeneric
          id="email"
          label="Email"
          type="email"
          name="email"
          value={registerstate.email}
          onChange={changeHandler}
          onBlur={handleBlur}
        />
        {Array.isArray(error.email) && error.email.length > 0 && (
          <div className="text-red-400 mb-3 space-y-1 text-sm flex items-start">
            {error.email.map((message, index) => (
              <p key={index} className="flex items-start">
                {message}
              </p>
            ))}
          </div>
        )}

        <ImputGeneric
          id="password"
          label="Contraseña"
          type="password"
          name="password"
          value={registerstate.password}
          onChange={changeHandler}
          onBlur={handleBlur}
        />
        {Array.isArray(error.password) && error.password.length > 0 && (
          <div className="text-red-400 mb-3 space-y-1 text-sm">
            {error.password.map((message, index) => (
              <p key={index} className="flex items-start">
                {message}
              </p>
            ))}
          </div>
        )}

        <ImputGeneric
          id="confPassword"
          label="Confirmar contraseña"
          type="password"
          name="confPassword"
          value={registerstate.confPassword}
          onChange={changeHandler}
          onBlur={handleBlur}
        />
        {error.confPassword && <div className="text-red-400 mb-3 space-y-1 text-sm">{error.confPassword}</div>}

        <ButtonForm name="Registrar" type="submit" />
        <div className="flex justify-center w-full mt-4">
          <Link href="/login" className="text-blue-500 mb-6 text-sm duration-150 hover:scale-[1.02] hover:underline">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>{" "}
      {/* Fin del div blanco */}
    </form>
  );
};
export default RegisterForm;
