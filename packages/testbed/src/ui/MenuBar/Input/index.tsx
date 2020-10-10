import React from "react";

import "./style.scss";

interface InputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
}

export const Input = ({ label, value, onChange }: InputProps) => (
    <label className="input">
        <input
            type="number"
            className="input--input"
            defaultValue={value}
            onChange={(e) => onChange(parseInt(e.currentTarget.value))}
        />
        {label}
    </label>
);
