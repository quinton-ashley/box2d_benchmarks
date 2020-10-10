import React from "react";
import { Link, useRouter } from "react-router-ts";

import { Menu } from "../MenuBar/Menu";
import { g_testEntries } from "../../tests";
import "./TestsMenu.scss";
import { testLabelToLink } from "../../utils/reactUtils";

export const TestsMenu = () => {
    const router = useRouter();
    const link = decodeURIComponent(router.path);
    return (
        <Menu label="Tests" prefix="tests">
            {g_testEntries.map(([groupLabel, entries]) => (
                <fieldset key={groupLabel}>
                    <legend>{groupLabel}</legend>
                    {entries.map(([label]) => (
                        <Link
                            href={testLabelToLink(label)}
                            key={label}
                            className={link === testLabelToLink(label) ? "active-link" : ""}
                        >
                            {label}
                        </Link>
                    ))}
                </fieldset>
            ))}
        </Menu>
    );
};
