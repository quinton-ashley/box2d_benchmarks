/* eslint-disable dot-notation */
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

import { b2Vec2, b2Transform, b2Rot } from "./b2_math";
import { b2Color, b2Draw } from "./b2_draw";
import { b2Shape, b2ShapeType } from "../collision/b2_shape";
import { b2ChainShape } from "../collision/b2_chain_shape";
import { b2CircleShape } from "../collision/b2_circle_shape";
import { b2EdgeShape } from "../collision/b2_edge_shape";
import { b2PolygonShape } from "../collision/b2_polygon_shape";
import { b2Body, b2BodyType } from "../dynamics/b2_body";
import { b2Fixture, b2FixtureProxy } from "../dynamics/b2_fixture";
import { b2World } from "../dynamics/b2_world";
import { b2PrismaticJoint } from "../dynamics/b2_prismatic_joint";
import { b2WheelJoint } from "../dynamics/b2_wheel_joint";
import { b2RevoluteJoint } from "../dynamics/b2_revolute_joint";
import { b2Joint, b2JointType } from "../dynamics/b2_joint";
import { b2PulleyJoint } from "../dynamics/b2_pulley_joint";
import { b2MouseJoint } from "../dynamics/b2_mouse_joint";
import { b2DistanceJoint } from "../dynamics/b2_distance_joint";
import { b2Rope } from "../rope/b2_rope";
import { b2_linearSlop, b2_maxFloat } from "./b2_common";

const debugColors = {
    badBody: new b2Color(1.0, 0.0, 0.0),
    disabledBody: new b2Color(0.5, 0.5, 0.3),
    staticBody: new b2Color(0.5, 0.9, 0.5),
    kinematicBody: new b2Color(0.5, 0.5, 0.9),
    sleepingBody: new b2Color(0.6, 0.6, 0.6),
    body: new b2Color(0.9, 0.7, 0.7),
    pair: new b2Color(0.3, 0.9, 0.9),
    aabb: new b2Color(0.9, 0.3, 0.9),

    joint1: new b2Color(0.7, 0.7, 0.7),
    joint2: new b2Color(0.3, 0.9, 0.3),
    joint3: new b2Color(0.9, 0.3, 0.3),
    joint4: new b2Color(0.3, 0.3, 0.9),
    joint5: new b2Color(0.4, 0.4, 0.4),
    joint6: new b2Color(0.5, 0.8, 0.8),
    joint7: new b2Color(0.0, 1, 0.0),
    joint8: new b2Color(0.8, 0.8, 0.8),

    rope: new b2Color(0.4, 0.5, 0.7),
    ropePointG: new b2Color(0.1, 0.8, 0.1),
    ropePointD: new b2Color(0.7, 0.2, 0.4),
};

const temp = {
    cA: new b2Vec2(),
    cB: new b2Vec2(),
    vs: b2Vec2.MakeArray(4),
    xf: new b2Transform(),
    pA: new b2Vec2(),
    pB: new b2Vec2(),
    axis: new b2Vec2(),
    lower: new b2Vec2(),
    upper: new b2Vec2(),
    perp: new b2Vec2(),
    p1: new b2Vec2(),
    p2: new b2Vec2(),
    rlo: new b2Vec2(),
    rhi: new b2Vec2(),
    r: new b2Vec2(),
    pRest: new b2Vec2(),
};

export function GetShapeColor(b: b2Body) {
    if (b.GetType() === b2BodyType.b2_dynamicBody && b.m_mass === 0.0) {
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
        const xf: b2Transform = b.m_xf;

        draw.PushTransform(xf);

        for (let f: b2Fixture | null = b.GetFixtureList(); f; f = f.m_next) {
            DrawShape(draw, f, GetShapeColor(b));
        }

        draw.PopTransform(xf);
    }
}

export function DrawJoints(draw: b2Draw, world: b2World) {
    for (let j = world.GetJointList(); j; j = j.m_next) {
        DrawJoint(draw, j);
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
                const proxy: b2FixtureProxy = f.m_proxies[i];

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

export function DrawShape(draw: b2Draw, fixture: b2Fixture, color: b2Color): void {
    const shape: b2Shape = fixture.GetShape();

    switch (shape.m_type) {
        case b2ShapeType.e_circle: {
            const circle: b2CircleShape = shape as b2CircleShape;
            const center: b2Vec2 = circle.m_p;
            const radius: number = circle.m_radius;
            const axis: b2Vec2 = b2Vec2.UNITX;
            draw.DrawSolidCircle(center, radius, axis, color);
            break;
        }

        case b2ShapeType.e_edge: {
            const edge: b2EdgeShape = shape as b2EdgeShape;
            const v1: b2Vec2 = edge.m_vertex1;
            const v2: b2Vec2 = edge.m_vertex2;
            draw.DrawSegment(v1, v2, color);

            if (edge.m_oneSided === false) {
                draw.DrawPoint(v1, 4.0, color);
                draw.DrawPoint(v2, 4.0, color);
            }
            break;
        }

        case b2ShapeType.e_chain: {
            const chain: b2ChainShape = shape as b2ChainShape;
            const vertices: b2Vec2[] = chain.m_vertices;
            let v1: b2Vec2 = vertices[0];
            for (let i = 1; i < vertices.length; ++i) {
                const v2: b2Vec2 = vertices[i];
                draw.DrawSegment(v1, v2, color);
                v1 = v2;
            }

            break;
        }

        case b2ShapeType.e_polygon: {
            const poly: b2PolygonShape = shape as b2PolygonShape;
            const vertexCount: number = poly.m_count;
            const vertices: b2Vec2[] = poly.m_vertices;
            draw.DrawSolidPolygon(vertices, vertexCount, color);
            break;
        }
    }
}

export function DrawWheelOrPrismaticJoint(draw: b2Draw, joint: b2PrismaticJoint | b2WheelJoint): void {
    const { p1, p2, pA, pB, axis } = temp;
    const xfA = joint.m_bodyA.GetTransform();
    const xfB = joint.m_bodyB.GetTransform();
    b2Transform.MultiplyVec2(xfA, joint.m_localAnchorA, pA);
    b2Transform.MultiplyVec2(xfB, joint.m_localAnchorB, pB);

    b2Rot.MultiplyVec2(xfA.q, joint.m_localXAxisA, axis);

    draw.DrawSegment(pA, pB, debugColors.joint5);

    if (joint.m_enableLimit) {
        const { lower, upper, perp } = temp;
        b2Vec2.AddScaled(pA, joint.m_lowerTranslation, axis, lower);
        b2Vec2.AddScaled(pA, joint.m_upperTranslation, axis, upper);
        b2Rot.MultiplyVec2(xfA.q, joint.m_localYAxisA, perp);
        draw.DrawSegment(lower, upper, debugColors.joint1);
        draw.DrawSegment(
            b2Vec2.SubtractScaled(lower, 0.5, perp, p1),
            b2Vec2.AddScaled(lower, 0.5, perp, p2),
            debugColors.joint2,
        );
        draw.DrawSegment(
            b2Vec2.SubtractScaled(upper, 0.5, perp, p1),
            b2Vec2.AddScaled(upper, 0.5, perp, p2),
            debugColors.joint3,
        );
    } else {
        draw.DrawSegment(b2Vec2.Subtract(pA, axis, p1), b2Vec2.Add(pA, axis, p2), debugColors.joint1);
    }

    draw.DrawPoint(pA, 5.0, debugColors.joint1);
    draw.DrawPoint(pB, 5.0, debugColors.joint4);
}

export function DrawRevoluteJoint(draw: b2Draw, joint: b2RevoluteJoint): void {
    const { p2, r, pA, pB } = temp;
    const xfA = joint.m_bodyA.GetTransform();
    const xfB = joint.m_bodyB.GetTransform();
    b2Transform.MultiplyVec2(xfA, joint.m_localAnchorA, pA);
    b2Transform.MultiplyVec2(xfB, joint.m_localAnchorB, pB);

    draw.DrawPoint(pA, 5.0, debugColors.joint4);
    draw.DrawPoint(pB, 5.0, debugColors.joint5);

    const aA = joint.m_bodyA.GetAngle();
    const aB = joint.m_bodyB.GetAngle();
    const angle = aB - aA - joint.m_referenceAngle;

    const L = 0.5;

    r.Set(Math.cos(angle), Math.sin(angle)).Scale(L);
    draw.DrawSegment(pB, b2Vec2.Add(pB, r, p2), debugColors.joint1);
    draw.DrawCircle(pB, L, debugColors.joint1);

    if (joint.m_enableLimit) {
        const { rlo, rhi } = temp;
        rlo.Set(Math.cos(joint.m_lowerAngle), Math.sin(joint.m_lowerAngle)).Scale(L);
        rhi.Set(Math.cos(joint.m_upperAngle), Math.sin(joint.m_upperAngle)).Scale(L);
        draw.DrawSegment(pB, b2Vec2.Add(pB, rlo, p2), debugColors.joint2);
        draw.DrawSegment(pB, b2Vec2.Add(pB, rhi, p2), debugColors.joint3);
    }

    draw.DrawSegment(xfA.p, pA, debugColors.joint6);
    draw.DrawSegment(pA, pB, debugColors.joint6);
    draw.DrawSegment(xfB.p, pB, debugColors.joint6);
}

export function DrawMouseJoint(draw: b2Draw, joint: b2MouseJoint): void {
    const p1 = joint.GetAnchorA(temp.pA);
    const p2 = joint.GetAnchorB(temp.pB);
    draw.DrawPoint(p1, 4, debugColors.joint7);
    draw.DrawPoint(p2, 4, debugColors.joint7);
    draw.DrawSegment(p1, p2, debugColors.joint8);
}

export function DrawPulleyJoint(draw: b2Draw, joint: b2PulleyJoint): void {
    const p1 = joint.GetAnchorA(temp.pA);
    const p2 = joint.GetAnchorB(temp.pB);
    const s1 = joint.GetGroundAnchorA();
    const s2 = joint.GetGroundAnchorB();
    draw.DrawSegment(s1, p1, debugColors.joint6);
    draw.DrawSegment(s2, p2, debugColors.joint6);
    draw.DrawSegment(s1, s2, debugColors.joint6);
}

export function DrawDistanceJoint(draw: b2Draw, joint: b2DistanceJoint): void {
    const { pA, pB, axis, pRest } = temp;
    const xfA = joint.m_bodyA.GetTransform();
    const xfB = joint.m_bodyB.GetTransform();
    b2Transform.MultiplyVec2(xfA, joint.m_localAnchorA, pA);
    b2Transform.MultiplyVec2(xfB, joint.m_localAnchorB, pB);
    b2Vec2.Subtract(pB, pA, axis);
    axis.Normalize();
    draw.DrawSegment(pA, pB, debugColors.joint5);
    b2Vec2.AddScaled(pA, joint.m_length, axis, pRest);
    draw.DrawPoint(pRest, 8.0, debugColors.joint1);
    if (joint.m_minLength !== joint.m_maxLength) {
        if (joint.m_minLength > b2_linearSlop) {
            const pMin = b2Vec2.AddScaled(pA, joint.m_minLength, axis, temp.p1);
            draw.DrawPoint(pMin, 4.0, debugColors.joint2);
        }
        if (joint.m_maxLength < b2_maxFloat) {
            const pMax = b2Vec2.AddScaled(pA, joint.m_maxLength, axis, temp.p1);
            draw.DrawPoint(pMax, 4.0, debugColors.joint3);
        }
    }
}

export function DrawJointFallback(draw: b2Draw, joint: b2Joint): void {
    const x1: b2Vec2 = joint.m_bodyA.GetTransform().p;
    const x2: b2Vec2 = joint.m_bodyB.GetTransform().p;
    const p1: b2Vec2 = joint.GetAnchorA(temp.pA);
    const p2: b2Vec2 = joint.GetAnchorB(temp.pB);
    draw.DrawSegment(x1, p1, debugColors.joint6);
    draw.DrawSegment(p1, p2, debugColors.joint6);
    draw.DrawSegment(x2, p2, debugColors.joint6);
}

export function DrawJoint(draw: b2Draw, joint: b2Joint): void {
    switch (joint.m_type) {
        case b2JointType.e_prismaticJoint:
        case b2JointType.e_wheelJoint:
            DrawWheelOrPrismaticJoint(draw, joint as b2PrismaticJoint | b2WheelJoint);
            break;
        case b2JointType.e_revoluteJoint:
            DrawRevoluteJoint(draw, joint as b2RevoluteJoint);
            break;
        case b2JointType.e_distanceJoint:
            DrawDistanceJoint(draw, joint as b2DistanceJoint);
            break;
        case b2JointType.e_pulleyJoint:
            DrawPulleyJoint(draw, joint as b2PulleyJoint);
            break;
        case b2JointType.e_mouseJoint:
            DrawMouseJoint(draw, joint as b2MouseJoint);
            break;
        default:
            DrawJointFallback(draw, joint);
            break;
    }
}

export function DrawRope(draw: b2Draw, rope: b2Rope): void {
    for (let i = 0; i < rope["m_count"] - 1; ++i) {
        draw.DrawSegment(rope["m_ps"][i], rope["m_ps"][i + 1], debugColors.rope);

        const pc: Readonly<b2Color> = rope["m_invMasses"][i] > 0.0 ? debugColors.ropePointD : debugColors.ropePointG;
        draw.DrawPoint(rope["m_ps"][i], 5.0, pc);
    }

    const pc: Readonly<b2Color> =
        rope["m_invMasses"][rope["m_count"] - 1] > 0.0 ? debugColors.ropePointD : debugColors.ropePointG;
    draw.DrawPoint(rope["m_ps"][rope["m_count"] - 1], 5.0, pc);
}
