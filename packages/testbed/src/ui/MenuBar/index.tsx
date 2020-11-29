import React from "react";

import "./style.scss";
import { TestsMenu } from "../menus/TestsMenu";

export const MenuBar = () => {
    return (
        <div className="menubar">
            <TestsMenu />
        </div>
    );
};
