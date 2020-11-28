/*
 * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

import { b2Vec2, b2Transform } from "./b2_math";
import { b2Draw, debugColors } from "./b2_draw";
import { b2Body, b2BodyType } from "../dynamics/b2_body";
import { b2Fixture } from "../dynamics/b2_fixture";
import { b2World } from "../dynamics/b2_world";
import { b2MakeArray } from "./b2_common";

const temp = {
    cA: new b2Vec2(),
    cB: new b2Vec2(),
    vs: b2MakeArray(4, b2Vec2),
    xf: new b2Transform(),
};

export function GetShapeColor(b: b2Body) {
    if (b.GetType() === b2BodyType.b2_dynamicBody && b.m_mass === 0) {
        // Bad body
        return debugColors.badBody;
    }
    if (!b.IsEnabled()) {
        return debugColors.disabledBody;
    }
    if (b.GetType() === b2BodyType.b2_staticBody) {
        return debugColors.staticBody;
    }
    if (b.GetType() === b2BodyType.b2_kinematicBody) {
        return debugColors.kinematicBody;
    }
    if (!b.IsAwake()) {
        return debugColors.sleepingBody;
    }
    return debugColors.body;
}

export function DrawShapes(draw: b2Draw, world: b2World) {
    for (let b = world.GetBodyList(); b; b = b.m_next) {
        const xf = b.m_xf;

        draw.PushTransform(xf);

        for (let f: b2Fixture | null = b.GetFixtureList(); f; f = f.m_next) {
            f.GetShape().Draw(draw, GetShapeColor(b));
        }

        draw.PopTransform(xf);
    }
}

export function DrawJoints(draw: b2Draw, world: b2World) {
    for (let j = world.GetJointList(); j; j = j.m_next) {
        j.Draw(draw);
    }
}

export function DrawPairs(draw: b2Draw, world: b2World) {
    for (let contact = world.GetContactList(); contact; contact = contact.m_next) {
        const fixtureA = contact.GetFixtureA();
        const fixtureB = contact.GetFixtureB();
        const indexA = contact.GetChildIndexA();
        const indexB = contact.GetChildIndexB();
        const cA = fixtureA.GetAABB(indexA).GetCenter(temp.cA);
        const cB = fixtureB.GetAABB(indexB).GetCenter(temp.cB);

        draw.DrawSegment(cA, cB, debugColors.pair);
    }
}

export function DrawAABBs(draw: b2Draw, world: b2World) {
    const { vs } = temp;
    for (let b = world.GetBodyList(); b; b = b.m_next) {
        if (!b.IsEnabled()) {
            continue;
        }

        for (let f: b2Fixture | null = b.GetFixtureList(); f; f = f.m_next) {
            for (let i = 0; i < f.m_proxyCount; ++i) {
                const proxy = f.m_proxies[i];

                const { aabb } = proxy.treeNode;
                vs[0].Set(aabb.lowerBound.x, aabb.lowerBound.y);
                vs[1].Set(aabb.upperBound.x, aabb.lowerBound.y);
                vs[2].Set(aabb.upperBound.x, aabb.upperBound.y);
                vs[3].Set(aabb.lowerBound.x, aabb.upperBound.y);

                draw.DrawPolygon(vs, 4, debugColors.aabb);
            }
        }
    }
}

export function DrawCenterOfMasses(draw: b2Draw, world: b2World) {
    const { xf } = temp;
    for (let b = world.GetBodyList(); b; b = b.m_next) {
        xf.q.Copy(b.m_xf.q);
        xf.p.Copy(b.GetWorldCenter());
        draw.DrawTransform(xf);
    }
}
