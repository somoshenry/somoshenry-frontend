import React from "react";

interface IButtonFormProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Hacemos 'name' obligatorio para el texto visible
  name: string;

  // Hacemos que 'children' sea opcional o lo excluimos,
  // ya que no usaremos contenido entre etiquetas.
  // Una forma estricta es omitir 'children' si nunca lo vas a usar:
}
// Us
export default IButtonFormProps;
