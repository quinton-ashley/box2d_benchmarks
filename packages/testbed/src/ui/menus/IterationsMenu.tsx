import React from "react";

import { Menu } from "../MenuBar/Menu";
import { Input } from "../MenuBar/Input";
import { useManager } from "../../manager";

const options = [
    ["Velocity", "m_velocityIterations"],
    ["Position", "m_positionIterations"],
    ["Particles", "m_particleIterations"],
    ["Hertz", "m_hertz"],
] as const;

export const IterationsMenu = () => {
    const manager = useManager();
    return (
        <Menu label="Iterations">
            {options.map(([label, option]) => (
                <Input
                    key={option}
                    label={label}
                    onChange={(value) => {
                        manager.m_settings[option] = value;
                        console.log(option, value);
                    }}
                    value={manager.m_settings[option]}
                />
            ))}
            {/* fixme: allow insertion of more via portals */}
        </Menu>
    );
};
