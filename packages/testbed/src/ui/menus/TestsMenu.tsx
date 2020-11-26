import React from "react";
import { Link, useRouter } from "react-router-ts";

import { Menu } from "../MenuBar/Menu";
import "./TestsMenu.scss";
import { testLabelToLink } from "../../utils/reactUtils";
import { useManager } from "../../manager";

export const TestsMenu = () => {
    const router = useRouter();
    const link = decodeURIComponent(router.path);
    const manager = useManager();

    return (
        <Menu label="Tests" prefix="tests">
            {manager.groupedTests.map(({ name: groupName, tests }) => (
                <fieldset key={groupName}>
                    <legend>{groupName}</legend>
                    {tests.map(({ name }) => (
                        <Link
                            href={testLabelToLink(name)}
                            key={name}
                            className={link === testLabelToLink(name) ? "active-link" : ""}
                        >
                            {name}
                        </Link>
                    ))}
                </fieldset>
            ))}
        </Menu>
    );
};
