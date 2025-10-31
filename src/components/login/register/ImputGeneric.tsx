import IinputGenericProps from "../../../interfaces/IImputGenericProps";

export const ImputGeneric = ({id, label, ...props}: IinputGenericProps) => {
  return (
    <div className="text-Oscuro flex w-full flex-col items-start justify-center">
      <label htmlFor={id} className="font-text text-black text-lg">
        {label}
      </label>

      <input
        id={id}
        {...props}
        className="text-gray-700 bg-gray-100 focus:border-[#ffff00] mb-4 w-full rounded-lg px-3 py-2  text-lg transition duration-300 invalid:border-red-500 invalid:ring-1 invalid:ring-red-500 focus:ring-2 focus:outline-[#ffff00]"
      />
    </div>
  );
};

export default ImputGeneric;
