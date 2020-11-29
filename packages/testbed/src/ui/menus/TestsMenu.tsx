import React, { useState } from "react";
import { Link, useRouter } from "react-router-ts";

import { Menu } from "../MenuBar/Menu";
import "./TestsMenu.scss";
import { getTestLink } from "../../utils/reactUtils";
import { useManager } from "../../manager";
import { TestEntry } from "../../test";

interface TestsMenuGroupProps {
    name: string;
    link: string;
    tests: TestEntry[];
}

const TestsMenuGroup = ({ name, link, tests }: TestsMenuGroupProps) => {
    const [open, setOpen] = useState(false);
    const legendClasses: string[] = [];
    const active = tests.some((test) => link === getTestLink(test));
    if (active) legendClasses.push("active-legend");
    if (open) legendClasses.push("open-legend");
    return (
        <fieldset>
            <legend onClick={() => setOpen(!open)} tabIndex={0} className={legendClasses.join(" ")}>
                {name}
            </legend>
            {open && (
                <div>
                    {tests.map((test) => (
                        <Link
                            href={getTestLink(test)}
                            key={test.name}
                            className={link === getTestLink(test) ? "active-link" : ""}
                        >
                            {test.name}
                        </Link>
                    ))}
                </div>
            )}
        </fieldset>
    );
};

export const TestsMenu = () => {
    const router = useRouter();
    const link = decodeURIComponent(router.path);
    const manager = useManager();

    return (
        <Menu label="Tests" prefix="tests">
            {manager.groupedTests.map(({ name, tests }) => (
                <TestsMenuGroup key={name} name={name} tests={tests} link={link} />
            ))}
        </Menu>
    );
};
