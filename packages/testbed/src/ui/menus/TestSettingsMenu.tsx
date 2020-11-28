import React from "react";

import { Menu } from "../MenuBar/Menu";
import { TestControl } from "../../testControls";
import { SettingsTable } from "./SettingsTable";

interface TestSettingsMenuProps {
    testControls: TestControl[];
}

export const TestSettingsMenu = ({ testControls }: TestSettingsMenuProps) => (
    <Menu label="Test Settings">
        {testControls.length ? <SettingsTable controls={testControls} /> : "None for this test"}
    </Menu>
);
