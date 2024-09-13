import React from "react";
import ReactDOM from "react-dom";

interface PopupProps {
  children: React.ReactNode;
  show: boolean;
}

export const Popup: React.FC<PopupProps> = ({ children, show }) => {
  if (!show) return null;

  return ReactDOM.createPortal(<div>{children}</div>, document.body);
};
