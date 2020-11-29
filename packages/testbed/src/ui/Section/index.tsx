import React, { PropsWithChildren, useState } from "react";

import "./style.scss";

interface TestsMenuGroupProps {
    legend: string;
    defaultOpen?: boolean;
}

export const Section = ({ legend, children, defaultOpen = false }: PropsWithChildren<TestsMenuGroupProps>) => {
    const [open, setOpen] = useState(defaultOpen);
    const legendClasses: string[] = [];
    if (open) legendClasses.push("open-legend");
    return (
        <fieldset className="section">
            <legend onClick={() => setOpen(!open)} tabIndex={0} className={legendClasses.join(" ")}>
                {legend}
            </legend>
            {open && <div>{children}</div>}
        </fieldset>
    );
};
