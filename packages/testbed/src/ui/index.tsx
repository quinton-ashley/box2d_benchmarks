import React from "react";
import ReactDOM from "react-dom";
import "typeface-open-sans";
import { Router } from "react-router-ts";

import { Main } from "./Main";
import { MenuBar } from "./MenuBar";

import "./style.scss";

ReactDOM.render(
    <Router mode="hash">
        <div className="container">
            <MenuBar />
            <Main />
        </div>
    </Router>,
    document.getElementById("root") as HTMLElement
);
