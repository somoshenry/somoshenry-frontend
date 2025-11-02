"use client";

import {useState} from "react";
import ButtonForm from "./ButtonForm";
import {useRouter} from "next/navigation";
import * as Yup from "yup";
import {ValidationError} from "yup";
import Swal from "sweetalert2";
import ImputGeneric from "./ImputGeneric";
import Link from "next/link";
import Image from "next/image";
import IRegisterFormProps from "@/interfaces/IRegisterFormProps";
import axios from "axios";

export const RegisterForm = () => {
  const [error, setError] = useState<Record<string, string[]>>({});
  const [registerstate, setregisterstate] = useState<IRegisterFormProps>({
    name: "",
    lastName: "",
    username: "",
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

  const registerValidateSchema = Yup.object({
    name: Yup.string()
      .required("El nombre es requerido.")
      .min(2, "Debe contener al menos dos caracteres.")
      .max(10, "Debe contener un máximo de 10 caracteres.")
      .matches(/^\S+(?: \S+)*$/, "No se permiten espacios dobles, ni al inicio o final.")
      .trim(),

    lastName: Yup.string()
      .required("El apellido es requerido.")
      .min(2, "Debe contener al menos dos caracteres.")
      .max(20, "Debe contener un máximo de 20 caracteres.")
      .matches(/^\S+(?: \S+)*$/, "No se permiten espacios dobles, ni al inicio o final.")
      .trim(),

    email: Yup.string().required("El correo electrónico es requerido.").email("Debe ser un correo electrónico válido."),

    password: Yup.string()
      .required("La contraseña es requerida.")
      .min(8, "Debe tener al menos 8 caracteres.")
      .max(16, "Debe tener un máximo de 16 caracteres.")
      .matches(/[A-Z]+/, "Debe contener al menos una mayúscula.")
      .matches(/\d+/, "Debe tener al menos un número."),

    confPassword: Yup.string()
      .required("La confirmación de contraseña es requerida.")
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

  // Función para enviar la petición al backend
  const postRegister = async () => {
    const registerDto = {
      email: registerstate.email,
      username: registerstate.email,
      password: registerstate.password,
      name: registerstate.name,
      lastName: registerstate.lastName,
      role: "TEACHER", // o 'STUDENT' NO SE QUE VA ACA ...
      status: "ACTIVE",
    };

    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, registerDto);

    return response.data;
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
      try {
        // Llama al backend
        await postRegister();

        await Swal.fire({
          icon: "success",
          title: "¡Registro exitoso!",
          text: "Tu cuenta ha sido creada correctamente.",
        });

        // Limpiar el formulario
        setregisterstate({
          name: "",
          username: "",
          lastName: "",
          email: "",
          password: "",
          confPassword: "",
        });

        router.push("/login");
      } catch (error) {
        let errorMessage = "Ocurrió un error durante el registro";

        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || errorMessage;
        }

        await Swal.fire({
          icon: "error",
          title: "Error en el registro",
          text: errorMessage,
        });
      }
    } else {
      await Swal.fire({
        icon: "error",
        title: "Validación fallida",
        text: "Por favor, revisa los campos del formulario",
      });
    }
  };

  return (
    <form
      className="shadow-Oscuro border-[#ffff00] mx-auto flex w-11/12 max-w-md min-w-[400px] flex-col dark:bg-gray-100 bg-gray-100 items-center rounded-xl border-t-4 m-8 shadow-2xl"
      onSubmit={submitHandel}
      noValidate
    >
      <div className=" flex flex-col justify-center text-center pt-10 pb-4 w-full ">
        <Image src="/user.png" alt="Ícono de usuario" width={64} height={64} className="mx-auto block mb-2" />
        <p className="text-3xl text-black mb-2">Crear cuenta</p>
        <p className="text-md text-gray-700">Únete a somosHenry</p>
      </div>
      <div className="p-10 bg-white dark:bg-gray-200 w-full rounded-xl">
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
              <div className="text-red-400 mb-3 space-y-2 text-xs w-full">
                {error.name.map((message, index) => (
                  <p key={index} className="flex items-start">
                    *{message}
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
              <div className="text-red-400 mb-3 text-xs space-y-2 w-full">
                {error.lastName.map((message, index) => (
                  <p key={index} className="flex items-start">
                    *{message}
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
          <div className="text-red-400 mb-3  text-xs flex space-y-2 items-start">
            {error.email.map((message, index) => (
              <p key={index} className="flex items-start">
                *{message}
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
          <div className="text-red-400 mb-3 space-y-2 text-xs">
            {error.password.map((message, index) => (
              <p key={index} className="flex items-start">
                *{message}
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
        {error.confPassword && <div className="text-red-400 mb-3 text-xs">{error.confPassword}</div>}

        <ButtonForm name="Registrar" type="submit" />
        <div className="flex justify-center w-full mt-4">
          <Link href="/login" className="text-blue-500 mb-2 text-sm duration-150 hover:scale-[1.02] hover:underline">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
        <p className="text-center w-full text-black mb-2 text-xl"> - o -</p>
        <div className="flex justify-center w-full">
          <Link
            className="bg-white w-full text-center hover:shadow-black text-md mt-2 transform cursor-pointer rounded-lg py-1 text-black shadow-sm/30 duration-300 hover:scale-105 hover:rainbow-shadow-hover"
            href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
          >
            Registrate con Google
          </Link>
        </div>
      </div>
    </form>
  );
};
export default RegisterForm;
