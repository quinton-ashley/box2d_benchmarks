import React, { useReducer } from "react";
import ReactDOM from "react-dom";
import "typeface-open-sans";
import { Router } from "react-router-ts";

import { Main } from "./Main";
import { MenuBar } from "./MenuBar";
import { TestControl } from "../testControls";

import "./style.scss";

const defaultTestControlsState = {
    key: 0,
    controls: [] as TestControl[],
};

export type TestControlsState = typeof defaultTestControlsState;

function reduceTestControls(state: TestControlsState, controls: TestControl[]) {
    return {
        key: state.key + 1,
        controls,
    };
}

function App() {
    const [testControls, setTestControls] = useReducer(reduceTestControls, defaultTestControlsState);

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
