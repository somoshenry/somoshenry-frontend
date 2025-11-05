import IinputGenericProps from "../../../interfaces/IImputGenericProps";

export const ImputGeneric = ({id, label, labelRightContent, rightContent, ...props}: IinputGenericProps) => {
  return (
    <div className="text-Oscuro flex w-full flex-col items-start justify-center mt-4">
      <div className="flex items-center mb-1">
        <label htmlFor={id} className="font-text text-black text-lg">
          {label}
        </label>
        {labelRightContent}
      </div>

      <div className="relative w-full text-gray-700 bg-gray-100 rounded-lg transition duration-300">
        <input
          id={id}
          {...props}
          className="bg-transparent w-full rounded-lg px-3 py-2 pr-12 text-lg focus:outline-none"
        />

        {rightContent && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">{rightContent}</div>
        )}
      </div>
    </div>
  );
};

export default ImputGeneric;
