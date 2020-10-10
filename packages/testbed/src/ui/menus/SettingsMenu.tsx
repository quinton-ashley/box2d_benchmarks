import React from "react";

import { Menu } from "../MenuBar/Menu";
import { Checkbox } from "../MenuBar/Checkbox";
import { useManager } from "../../manager";

const options = [
    ["Sleep", "m_enableSleep"],
    ["Warm Starting", "m_enableWarmStarting"],
    ["Time of Impact", "m_enableContinuous"],
    ["Sub-Stepping", "m_enableSubStepping"],
    ["Strict Particle/Body Contacts", "m_strictContacts"],
] as const;

export const SettingsMenu = () => {
    const manager = useManager();
    return (
        <Menu label="Settings">
            {options.map(([label, option]) => (
                <Checkbox
                    key={option}
                    label={label}
                    onClick={(e) => {
                        manager.m_settings[option] = e.currentTarget.checked;
                    }}
                    checked={manager.m_settings[option]}
                />
            ))}
            {/* fixme: allow insertion of more via portals */}
        </Menu>
    );
};
