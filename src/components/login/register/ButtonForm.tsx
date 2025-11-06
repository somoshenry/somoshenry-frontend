import IButtonFormProps from "../../../interfaces/login-register/IButtonFrom";

// Las props se desestructuran así:
const ButtonForm = ({name, ...restProps}: IButtonFormProps) => {
  return (
    <button
      {...restProps}
      className="bg-[#ffff00] w-full hover:shadow-black text-md mt-6  transform cursor-pointer rounded-lg py-1  text-black shadow-sm/30 duration-300 hover:scale-105 hover:bg-gray-100"
    >
      {name}
    </button>
  );
};
export default ButtonForm;
