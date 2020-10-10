import React from "react";

import { Menu } from "../MenuBar/Menu";
import { Checkbox } from "../MenuBar/Checkbox";
import { useManager } from "../../manager";

const options = [
    ["Shapes", "m_drawShapes"],
    ["Particles", "m_drawParticles"],
    ["Joints", "m_drawJoints"],
    ["AABBs", "m_drawAABBs"],
    ["Contact Points", "m_drawContactPoints"],
    ["Contact Normals", "m_drawContactNormals"],
    ["Contact Impulses", "m_drawContactImpulse"],
    ["Friction Impulses", "m_drawFrictionImpulse"],
    ["Center of Masses", "m_drawCOMs"],
    ["Statistics", "m_drawStats"],
    ["Input Help", "m_drawInputHelp"],
    ["Profile", "m_drawProfile"],
    ["FPS Meter", "m_drawFpsMeter"],
] as const;

export const DrawMenu = () => {
    const manager = useManager();
    return (
        <Menu label="Draw">
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
