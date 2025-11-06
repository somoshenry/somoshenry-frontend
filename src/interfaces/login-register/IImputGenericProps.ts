import React from "react";

interface IinputGenericProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  id: string;
  rightContent?: React.ReactNode;
  labelRightContent?: React.ReactNode;
}
export default IinputGenericProps;
