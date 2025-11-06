// ValidatedInput.tsx
import {useState} from "react";
import ImputGeneric from "./ImputGeneric";
import {Info, Check, X, Eye, EyeClosed} from "lucide-react";
import IinputGenericProps from "../../../interfaces/login-register/IImputGenericProps";

type Rule = {
  text: string;
  check: boolean;
};

// Extiende la interfaz y añade las props de control de contraseña
interface ValidatedInputProps extends IinputGenericProps {
  rules?: Rule[];
  errors: string[] | undefined;
  isPasswordType?: boolean;
  isVisible?: boolean;
  onVisibilityMouseDown?: () => void;
  onVisibilityMouseUp?: () => void;
}

export const ValidatedInput = ({
  id,
  label,
  rules,
  errors,
  isPasswordType = false,
  isVisible = false,
  onVisibilityMouseDown,
  onVisibilityMouseUp,
  ...props
}: ValidatedInputProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const passwordIcon =
    isPasswordType && onVisibilityMouseDown && onVisibilityMouseUp ? (
      <div
        className="cursor-pointer text-gray-400 hover:text-gray-600 transition"
        onMouseDown={onVisibilityMouseDown}
        onMouseUp={onVisibilityMouseUp}
        onMouseLeave={onVisibilityMouseUp}
        onTouchStart={onVisibilityMouseDown}
        onTouchEnd={onVisibilityMouseUp}
      >
        {isVisible ? <Eye size={20} /> : <EyeClosed size={20} />}
      </div>
    ) : null;

  const infoIcon =
    rules && rules.length > 0 ? (
      <div className={`relative ml-2`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <Info className="w-4 h-4 text-gray-400 cursor-help" />
        {isHovered && (
          <div className="absolute mt-2 z-50 p-3 w-64 bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-800">
            <p className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">Este campo debe cumplir:</p>
            <ul className="space-y-1 text-xs list-disc text-black dark:text-gray-100 ml-4">
              {rules.map((rule, index) => (
                <li
                  key={index}
                  className={`flex items-center text-xs ${rule.check ? "text-green-600" : "text-red-500"}`}
                >
                  {rule.check ? (
                    <Check size={16} className="mr-1 text-green-600" />
                  ) : (
                    <X size={16} className="mr-1 text-red-500" />
                  )}
                  {rule.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ) : null;

  return (
    <div className="flex flex-col w-full">
      <ImputGeneric id={id} label={label} {...props} rightContent={passwordIcon} labelRightContent={infoIcon} />

      {Array.isArray(errors) && errors.length > 0 && (
        <div className="text-red-400 mb-3 space-y-1 text-xs w-full">
          {errors.map((message, index) => (
            <p key={index} className="flex items-start">
              * {message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ValidatedInput;
