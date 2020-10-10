import React, { MouseEventHandler } from "react";

import "./style.scss";

interface CheckboxProps {
    label: string;
    onClick: MouseEventHandler<HTMLInputElement>;
    checked: boolean;
}

export const Checkbox = ({ label, onClick, checked }: CheckboxProps) => (
    <label className="checkbox">
        <input type="checkbox" className="checkbox--input" onClick={onClick} defaultChecked={checked} />
        {label}
    </label>
);
