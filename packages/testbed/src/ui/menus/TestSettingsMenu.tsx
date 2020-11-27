import React from "react";

import { Menu } from "../MenuBar/Menu";
import { TestControls } from "../../testControls";
import { SettingsTable } from "./SettingsTable";

interface TestSettingsMenuProps {
    testControls: TestControls | null;
}

export const TestSettingsMenu = ({ testControls }: TestSettingsMenuProps) => (
    <Menu label="Test Settings">
        {testControls ? <SettingsTable controls={testControls.items} /> : "None for this test"}
    </Menu>
);
