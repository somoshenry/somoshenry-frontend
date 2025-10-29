interface IinputGenericProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  id: string;
}
export default IinputGenericProps;
