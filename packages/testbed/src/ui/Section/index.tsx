import React, { PropsWithChildren, useState } from "react";

import "./style.scss";

interface TestsMenuGroupProps {
    legend: string;
    legendClassName?: string;
    defaultOpen?: boolean;
}

export const Section = ({
    legend,
    legendClassName,
    children,
    defaultOpen = false,
}: PropsWithChildren<TestsMenuGroupProps>) => {
    const [open, setOpen] = useState(defaultOpen);
    const legendClasses: string[] = [];
    if (legendClassName) legendClasses.push(legendClassName);
    if (open) legendClasses.push("open-legend");
    return (
        <fieldset className="section">
            <legend onClick={() => setOpen(!open)} tabIndex={0} className={legendClasses.join(" ")}>
                {legend}
            </legend>
            <div className={open ? "" : "section-content-hidden"}>{children}</div>
        </fieldset>
    );
};
