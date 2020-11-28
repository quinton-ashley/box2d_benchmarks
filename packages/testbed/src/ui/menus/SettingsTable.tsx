import React from "react";

import { TestControl } from "../../testControls";
import { Checkbox } from "../controls/Checkbox";
import { Label } from "../controls/Label";
import { Radio } from "../controls/Radio";
import { Select } from "../controls/Select";
import { Separator } from "../controls/Separator";
import { Slider } from "../controls/Slider";

import "./SettingsTable.scss";

interface SettingsTableRowProps {
    control: TestControl;
}

const SettingsTableRow = ({ control }: SettingsTableRowProps) => {
    switch (control.type) {
        case "slider":
            return <Slider control={control} />;
        case "checkbox":
            return <Checkbox control={control} />;
        case "radio":
            return <Radio control={control} />;
        case "select":
            return <Select control={control} />;
        case "label":
            return <Label control={control} />;
        case "separator":
            return <Separator />;
    }
    return null;
};

interface SettingsTableProps {
    controls: TestControl[];
}
export const SettingsTable = ({ controls }: SettingsTableProps) => (
    <div className="settings-table">
        {controls.map((control) => (
            <SettingsTableRow key={control.name} control={control} />
        ))}
    </div>
);
