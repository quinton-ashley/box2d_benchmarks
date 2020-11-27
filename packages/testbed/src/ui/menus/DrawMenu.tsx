import React from "react";

import { Menu } from "../MenuBar/Menu";
import { useManager } from "../../manager";
import { settingsCheckboxDef } from "../../testControls";
import { SettingsTable } from "./SettingsTable";
import { separatorDef } from "../controls/Separator";

export const DrawMenu = () => {
    const manager = useManager();
    const controls = [
        settingsCheckboxDef(manager, "m_drawShapes", "Shapes"),
        settingsCheckboxDef(manager, "m_drawParticles", "Particles"),
        settingsCheckboxDef(manager, "m_drawJoints", "Joints"),
        settingsCheckboxDef(manager, "m_drawAABBs", "AABBs"),
        settingsCheckboxDef(manager, "m_drawContactPoints", "Contact Points"),
        settingsCheckboxDef(manager, "m_drawContactNormals", "Contact Normals"),
        settingsCheckboxDef(manager, "m_drawContactImpulse", "Contact Impulses"),
        settingsCheckboxDef(manager, "m_drawFrictionImpulse", "Friction Impulses"),
        settingsCheckboxDef(manager, "m_drawCOMs", "Center of Masses"),
        separatorDef("overlay"),
        settingsCheckboxDef(manager, "m_drawStats", "Statistics"),
        settingsCheckboxDef(manager, "m_drawInputHelp", "Input Help"),
        settingsCheckboxDef(manager, "m_drawProfile", "Profile"),
        settingsCheckboxDef(manager, "m_drawFpsMeter", "FPS Meter"),
    ];
    return (
        <Menu label="Draw">
            <SettingsTable controls={controls} />
        </Menu>
    );
};
