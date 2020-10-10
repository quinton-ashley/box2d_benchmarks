import React, { MouseEventHandler } from "react";

import "./style.scss";

interface MenuButtonProps {
    label: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
}

export const MenuButton = ({ label, onClick }: MenuButtonProps) => (
    <button className="menubutton" onClick={onClick}>
        {label}
    </button>
);
