"use client";

import {useState} from "react";
import ButtonForm from "./ButtonForm";
import {useRouter} from "next/navigation";
import * as Yup from "yup";
import {ValidationError} from "yup";
import Swal from "sweetalert2";
// 🛑 Importamos ValidatedInput
import ValidatedInput from "./ValidatedInput";
import Link from "next/link";
import Image from "next/image";
import IRegisterFormProps from "@/interfaces/IRegisterFormProps";
import axios from "axios";
import LoadingTransition from "@/components/ui/LoadingTransition";
import {text} from "node:stream/consumers";
// Se importan los íconos necesarios, incluyendo Eye y EyeOff

export const RegisterForm = () => {
  const [error, setError] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  // 🆕 ESTADOS INDEPENDIENTES PARA LA VISIBILIDAD DE CADA CAMPO DE CONTRASEÑA
  const [isPwdVisible, setIsPwdVisible] = useState(false);
  const [isConfPwdVisible, setIsConfPwdVisible] = useState(false);

  const [registerstate, setregisterstate] = useState<IRegisterFormProps>({
    name: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confPassword: "",
  });

  const router = useRouter();

  // Las reglas se mantienen igual
  const nameRules = [
    {
      text: "De 3 a 20 caracteres",
      check: registerstate.name.length >= 3 && registerstate.name.length <= 20,
    },
    {text: "No se permiten espacios dobles", check: /^\S+(?: \S+)*$/.test(registerstate.name)},
    {text: "Solo puede contener letras", check: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(registerstate.name)},
  ];

  const emailRules = [
    {
      text: "Debe ser un email valido",
      check: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(registerstate.email),
    },
  ];

  const LastNameRules = [
    {
      text: "Desde 2 a 20 caracteres",
      check: registerstate.lastName.length >= 2 && registerstate.lastName.length <= 20,
    },
    {
      text: "No se permiten espacios dobles",
      check: /^\S+(?: \S+)*$/.test(registerstate.lastName),
    },
    {text: "Solo puede contener letras", check: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(registerstate.lastName)},
  ];

  const passwordRules = [
    {text: "Desde 8 a 16 caracteres", check: registerstate.password.length >= 8 && registerstate.password.length <= 16},
    {text: "Al menos una mayúscula (A-Z)", check: /[A-Z]/.test(registerstate.password)},
    {text: "Al menos un número (0-9)", check: /\d/.test(registerstate.password)},
  ];

  // Esquema de validación Yup
  const registerValidateSchema = Yup.object({
    name: Yup.string()
      .required("El nombre es requerido.")
      .min(2, "Debe contener al menos dos caracteres.")
      .max(20, "Debe contener un máximo de 20 caracteres.")
      .matches(/^\S+(?: \S+)*$/, "No se permiten espacios dobles.")
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "El nombre solo puede contener letras")
      .trim(),

    lastName: Yup.string()
      .required("El apellido es requerido.")
      .min(2, "Debe contener al menos dos caracteres.")
      .max(20, "Debe contener un máximo de 20 caracteres.")
      .matches(/^\S+(?: \S+)*$/, "No se permiten espacios dobles.")
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "El nombre solo puede contener letras")
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

  const postRegister = async () => {
    const registerDto = {
      email: registerstate.email,
      username: registerstate.email,
      password: registerstate.password,
      name: registerstate.name,
      lastName: registerstate.lastName,
      role: "TEACHER",
      status: "ACTIVE",
    };

    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, registerDto);

    return response.data;
  };

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;

    setregisterstate((prev) => {
      const newState = {...prev, [name]: value};
      validateFieldLive(name, newState);
      return newState;
    });
  };

  const validateFieldLive = async (fieldName: string, currentState: IRegisterFormProps) => {
    try {
      await registerValidateSchema.validateAt(fieldName, currentState);
      setError((prevErrors) => {
        const newErrors = {...prevErrors};
        delete newErrors[fieldName];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        setError((prevErrors) => ({
          ...prevErrors,
          [fieldName]: error.errors,
        }));
      }
    }
  };

  const handleBlur = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name} = e.target;
    validateFieldLive(name, registerstate);
  };

  // 🆕 FUNCIONES PARA GESTIONAR LA VISIBILIDAD AL MANTENER EL CLICK
  const handleMouseDown = (field: "password" | "confPassword") => {
    if (field === "password") {
      setIsPwdVisible(true);
    } else {
      setIsConfPwdVisible(true);
    }
  };

  const handleMouseUp = (field: "password" | "confPassword") => {
    if (field === "password") {
      setIsPwdVisible(false);
    } else {
      setIsConfPwdVisible(false);
    }
  };

  const submitHandel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const valid = await validateRegister(registerstate);

    if (valid) {
      try {
        setIsLoading(true);

        await postRegister();

        await Swal.fire({
          icon: "success",
          title: "¡Registro exitoso!",
          text: "Tu cuenta ha sido creada correctamente.",
          timer: 1500,
          showConfirmButton: false,
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

        setTimeout(() => {
          router.push("/login");
        }, 500);
      } catch (error) {
        setIsLoading(false);
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
    <>
      {isLoading && <LoadingTransition message="Creando tu cuenta..." />}

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
            <div className="w-1/2">
              <ValidatedInput
                id="name"
                label="Nombre"
                name="name"
                value={registerstate.name}
                onChange={changeHandler}
                onBlur={handleBlur}
                rules={nameRules}
                errors={error.name}
              />
            </div>

            <div className="w-1/2">
              <ValidatedInput
                id="lastName"
                label="Apellido"
                name="lastName"
                value={registerstate.lastName}
                onChange={changeHandler}
                onBlur={handleBlur}
                rules={LastNameRules}
                errors={error.lastName}
              />
            </div>
          </div>

          <ValidatedInput
            id="email"
            label="Email"
            type="email"
            name="email"
            value={registerstate.email}
            onChange={changeHandler}
            onBlur={handleBlur}
            rules={emailRules}
            errors={error.email}
          />

          {/* INPUT CONTRASEÑA (Usa ValidatedInput con lógica de "click and hold") */}
          <ValidatedInput
            id="password"
            label="Contraseña"
            // 🛑 TIPO DINÁMICO
            type={isPwdVisible ? "text" : "password"}
            name="password"
            value={registerstate.password}
            onChange={changeHandler}
            onBlur={handleBlur}
            rules={passwordRules}
            errors={error.password}
            // 🆕 PROPS DE CONTROL DE VISIBILIDAD
            isPasswordType={true}
            isVisible={isPwdVisible}
            onVisibilityMouseDown={() => handleMouseDown("password")}
            onVisibilityMouseUp={() => handleMouseUp("password")}
          />

          {/* INPUT CONFIRMAR CONTRASEÑA (Usa ValidatedInput con lógica de "click and hold" independiente) */}
          <ValidatedInput
            id="confPassword"
            label="Confirmar contraseña"
            type={isConfPwdVisible ? "text" : "password"}
            name="confPassword"
            value={registerstate.confPassword}
            onChange={changeHandler}
            onBlur={handleBlur}
            errors={error.confPassword}
            isPasswordType={true}
            isVisible={isConfPwdVisible}
            onVisibilityMouseDown={() => handleMouseDown("confPassword")}
            onVisibilityMouseUp={() => handleMouseUp("confPassword")}
          />

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
    </>
  );
};
export default RegisterForm;
