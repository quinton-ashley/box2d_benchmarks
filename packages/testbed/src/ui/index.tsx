import React, { useReducer } from "react";
import ReactDOM from "react-dom";
import "typeface-open-sans";
import { Router } from "react-router-ts";

import { Main } from "./Main";
import { MenuBar } from "./MenuBar";
import { TestControl } from "../testControls";
import { SideBar } from "./SideBar";
import packageData from "../../package.json";

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
            <MenuBar />
            <Main setTestControls={setTestControls} />
            <SideBar testControls={testControls} />
        </div>
    );
}

document.title = `@Box2D Testbed v${packageData.version}`;

ReactDOM.render(
    <Router mode="hash">
        <App />
    </Router>,
    document.getElementById("root") as HTMLElement,
);
