import React from "react";

import { TestControl } from "../../testControls";
import { Checkbox } from "../controls/Checkbox";
import { Separator } from "../controls/Separator";
import { Slider } from "../controls/Slider";

interface SettingsTableRowProps {
    control: TestControl;
}

const SettingsTableRow = ({ control }: SettingsTableRowProps) => {
    switch (control.type) {
        case "slider":
            return <Slider control={control} />;
        case "checkbox":
            return <Checkbox control={control} />;
        case "separator":
            return <Separator />;
    }
    return null;
};

interface SettingsTableProps {
    controls: TestControl[];
}
export const SettingsTable = ({ controls }: SettingsTableProps) => (
    <div>
        {controls.map((control) => (
            <SettingsTableRow key={control.name} control={control} />
        ))}
    </div>
);
