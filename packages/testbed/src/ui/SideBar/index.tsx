import React, { useEffect, useState } from "react";

import "./style.scss";
import { useManager } from "../../manager";
import { SettingsTable } from "../menus/SettingsTable";
import { Section } from "../Section";
import { settingsCheckboxDef, settingsSliderDef } from "../../testControls";
import { MenuButton } from "../MenuBar/MenuButton";
import type { TestControlsState } from "..";

interface SideBarProps {
    testControls: TestControlsState;
}

export const SideBar = ({ testControls }: SideBarProps) => {
    const [paused, setPaused] = useState(false);
    const manager = useManager();
    useEffect(() => {
        const connection = manager.onPauseChanged.connect(setPaused);
        return () => {
            connection.disconnect();
        };
    });
    const iterationControls = [
        settingsSliderDef(manager, "m_velocityIterations", "Velocity Iters", 0, 50, 1),
        settingsSliderDef(manager, "m_positionIterations", "Position Iters", 0, 50, 1),
        settingsSliderDef(manager, "m_particleIterations", "Particle Iters", 0, 50, 1),
        settingsSliderDef(manager, "m_hertz", "Hertz", 5, 120, 1),
    ];
    const settingsControls = [
        settingsCheckboxDef(manager, "m_enableSleep", "Sleep"),
        settingsCheckboxDef(manager, "m_enableWarmStarting", "Warm Starting"),
        settingsCheckboxDef(manager, "m_enableContinuous", "Time of Impact"),
        settingsCheckboxDef(manager, "m_enableSubStepping", "Sub-Stepping"),
        settingsCheckboxDef(manager, "m_strictContacts", "Strict Particle/Body Contacts"),
    ];
    const drawControls = [
        settingsCheckboxDef(manager, "m_drawShapes", "Shapes"),
        settingsCheckboxDef(manager, "m_drawParticles", "Particles"),
        settingsCheckboxDef(manager, "m_drawJoints", "Joints"),
        settingsCheckboxDef(manager, "m_drawAABBs", "AABBs"),
        settingsCheckboxDef(manager, "m_drawContactPoints", "Contact Points"),
        settingsCheckboxDef(manager, "m_drawContactNormals", "Contact Normals"),
        settingsCheckboxDef(manager, "m_drawContactImpulse", "Contact Impulses"),
        settingsCheckboxDef(manager, "m_drawFrictionImpulse", "Friction Impulses"),
        settingsCheckboxDef(manager, "m_drawCOMs", "Center of Masses"),
    ];
    const overlayControls = [
        settingsCheckboxDef(manager, "m_drawStats", "Statistics"),
        settingsCheckboxDef(manager, "m_drawInputHelp", "Input Help"),
        settingsCheckboxDef(manager, "m_drawProfile", "Profile"),
        settingsCheckboxDef(manager, "m_drawFpsMeter", "FPS Meter"),
    ];
    return (
        <div className="sidebar">
            <Section legend="Iterations" defaultOpen>
                <SettingsTable controls={iterationControls} />
            </Section>
            <Section legend="General" defaultOpen>
                <SettingsTable controls={settingsControls} />
            </Section>
            <Section legend="Draw" defaultOpen>
                <SettingsTable controls={drawControls} />
            </Section>
            <Section legend="Overlay" defaultOpen>
                <SettingsTable controls={overlayControls} />
            </Section>
            <Section legend="Test Settings" defaultOpen>
                {testControls.controls.length ? (
                    <SettingsTable key={testControls.key} controls={testControls.controls} />
                ) : (
                    "None for this test"
                )}
            </Section>
            <MenuButton label={paused ? "Continue (P)" : "Pause (P)"} onClick={() => manager.SetPause(!paused)} />
            <MenuButton label="Single Step (O)" onClick={() => manager.SingleStep()} />
            <MenuButton label="Restart (R)" onClick={() => manager.LoadTest()} />
        </div>
    );
};
