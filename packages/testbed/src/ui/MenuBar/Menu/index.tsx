import React, { PropsWithChildren } from "react";

import "./style.scss";
import { classPrefix } from "../../../utils/reactUtils";

interface MenuProps {
    label: string;
    prefix?: string;
}

export const Menu = ({ label, children, prefix }: PropsWithChildren<MenuProps>) => (
    <div className={classPrefix("menu", prefix)}>
        <div className={classPrefix("menu--label", prefix)}>{label}</div>
        <div className={classPrefix("menu--content", prefix)}>{children}</div>
    </div>
);
