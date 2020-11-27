import React from "react";

import { Menu } from "../MenuBar/Menu";
import { useManager } from "../../manager";
import { settingsSliderDef } from "../../testControls";
import { SettingsTable } from "./SettingsTable";

export const IterationsMenu = () => {
    const manager = useManager();

    const controls = [
        settingsSliderDef(manager, "m_velocityIterations", "Velocity Iters", 0, 50, 1),
        settingsSliderDef(manager, "m_positionIterations", "Position Iters", 0, 50, 1),
        settingsSliderDef(manager, "m_particleIterations", "Particle Iters", 0, 50, 1),
        settingsSliderDef(manager, "m_hertz", "Hertz", 5, 120, 1),
    ];
    return (
        <Menu label="Iterations">
            <SettingsTable controls={controls} />
        </Menu>
    );
};
