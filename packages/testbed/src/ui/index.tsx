import React, { useState } from "react";
import ReactDOM from "react-dom";
import "typeface-open-sans";
import { Router } from "react-router-ts";

import { Main } from "./Main";
import { MenuBar } from "./MenuBar";
import { TestControl } from "../testControls";

import "./style.scss";

function App() {
    const [testControls, setTestControls] = useState<TestControl[]>([]);
    return (
        <div className="container">
            <MenuBar testControls={testControls} />
            <Main setTestControls={setTestControls} />
        </div>
    );
}

ReactDOM.render(
    <Router mode="hash">
        <App />
    </Router>,
    document.getElementById("root") as HTMLElement,
);
