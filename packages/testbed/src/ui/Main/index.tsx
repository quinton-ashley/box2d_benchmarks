import React, { useEffect, useReducer, useRef } from "react";
import { useRouter } from "react-router-ts";

import { useManager } from "../../manager";
import { TestConstructor } from "../../test";
import { g_testEntries } from "../../tests";
import { testLabelToLink } from "../../utils/reactUtils";

interface TestComponentProps {
    title: string;
    constructor: TestConstructor;
}

export type TextTable = Array<[string, string]>;
export type TextTableSetter = (table: TextTable) => void;

function tableReducer(state: TextTable, action: TextTable) {
    if (JSON.stringify(state) !== JSON.stringify(action)) return action;
    return state;
}

interface TextTableProps {
    id: string;
    table: TextTable;
}

const TextTable = ({ id, table }: TextTableProps) => (
    <div id={id}>
        <table>
            <tbody>
                {table.map(([label, value], index) =>
                    value === "-" ? (
                        <tr key={index}>
                            <th colSpan={2}>{label}</th>
                        </tr>
                    ) : (
                        <tr key={index}>
                            <td>{label}</td>
                            <td>{value}</td>
                        </tr>
                    )
                )}
            </tbody>
        </table>
    </div>
);

const TestMain = ({ title, constructor }: TestComponentProps) => {
    const [leftTable, setLeftTable] = useReducer(tableReducer, []);
    const [rightTable, setRightTable] = useReducer(tableReducer, []);
    const glCanvasRef = useRef<HTMLCanvasElement>(null);
    const debugCanvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const manager = useManager();
    const router = useRouter();
    const test = useActiveTestEntry();
    useEffect(() => {
        const glCanvas = glCanvasRef.current;
        const debugCanvas = debugCanvasRef.current;
        const wrapper = wrapperRef.current;
        if (glCanvas && debugCanvas && wrapper) {
            const setTest = (label: string) => {
                router.history.push(testLabelToLink(label));
            };
            const loop = () => {
                window.requestAnimationFrame(loop);
                manager.SimulationLoop();
            };
            const init = () => {
                manager.init(glCanvas, debugCanvas, wrapper, setTest, setLeftTable, setRightTable);
                window.requestAnimationFrame(loop);
            };
            window.requestAnimationFrame(init);
        }
    }, [debugCanvasRef.current, glCanvasRef.current, wrapperRef.current, manager]);

    useEffect(() => {
        manager.setTest(title, constructor);
    }, [manager, constructor]);

    return (
        <main ref={wrapperRef}>
            <canvas ref={glCanvasRef} />
            <canvas ref={debugCanvasRef} />
            <TextTable id="left_overlay" table={leftTable} />
            <div id="title_overlay">{test?.[0] ?? ""}</div>
            <TextTable id="right_overlay" table={rightTable} />
        </main>
    );
};

export function useActiveTestEntry() {
    const router = useRouter();
    const link = decodeURIComponent(router.path);
    for (const [, entries] of g_testEntries) {
        for (const entry of entries) {
            if (testLabelToLink(entry[0]) === link) return entry;
        }
    }
    return null;
}

export const Main = () => {
    const entry = useActiveTestEntry();
    return entry ? (
        <TestMain title={entry[0]} constructor={entry[1]} />
    ) : (
        <main>Select a test from the menu in the top left corner</main>
    );
};
