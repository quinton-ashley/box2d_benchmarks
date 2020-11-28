import React from "react";

export function labelDef(name: string) {
    return {
        type: "label",
        name,
    } as const;
}

export type LabelDef = ReturnType<typeof labelDef>;

interface LabelProps {
    control: LabelDef;
}

export const Label = ({ control }: LabelProps) => <div>{control.name}</div>;
