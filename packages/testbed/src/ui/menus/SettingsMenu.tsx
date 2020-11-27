import React from "react";

import { Menu } from "../MenuBar/Menu";
import { useManager } from "../../manager";
import { settingsCheckboxDef } from "../../testControls";
import { SettingsTable } from "./SettingsTable";

export const SettingsMenu = () => {
    const manager = useManager();
    const controls = [
        settingsCheckboxDef(manager, "m_enableSleep", "Sleep"),
        settingsCheckboxDef(manager, "m_enableWarmStarting", "Warm Starting"),
        settingsCheckboxDef(manager, "m_enableContinuous", "Time of Impact"),
        settingsCheckboxDef(manager, "m_enableSubStepping", "Sub-Stepping"),
        settingsCheckboxDef(manager, "m_strictContacts", "Strict Particle/Body Contacts"),
    ];
    return (
        <Menu label="Settings">
            <SettingsTable controls={controls} />
        </Menu>
    );
};
