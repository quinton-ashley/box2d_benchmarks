import React from "react";

import { Menu } from "../MenuBar/Menu";
import { SettingsTable } from "./SettingsTable";
import type { TestControlsState } from "..";

interface TestSettingsMenuProps {
    testControls: TestControlsState;
}

export const TestSettingsMenu = ({ testControls: { key, controls } }: TestSettingsMenuProps) => (
    <Menu label="Test Settings">
        {controls.length ? <SettingsTable key={key} controls={controls} /> : "None for this test"}
    </Menu>
);
