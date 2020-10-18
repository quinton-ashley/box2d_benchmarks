/*
 * Copyright (c) 2006-2012 Erin Catto http://www.box2d.org
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

import {
    b2QueryCallback,
    b2CircleShape,
    b2Transform,
    b2Fixture,
    b2TestOverlapShape,
    b2Color,
    b2Body,
    b2PolygonShape,
    b2BodyDef,
    b2EdgeShape,
    b2Vec2,
    b2BodyType,
    b2RandomRange,
    b2FixtureDef,
    b2AABB,
} from "@box2d/core";

import { Test } from "../../test";
import { Settings } from "../../settings";
import { g_debugDraw } from "../../utils/draw";
import { HotKey, hotKeyPress } from "../../utils/hotkeys";

/**
 * This callback is called by b2World::QueryAABB. We find
 * all the fixtures that overlap an AABB. Of those, we use
 * b2TestOverlap to determine which fixtures overlap a circle.
 * Up to 4 overlapped fixtures will be highlighted with a yellow
 * border.
 */
export class PolyShapesCallback extends b2QueryCallback {
    public static readonly e_maxCount = 4;

    public m_circle = new b2CircleShape();

    public m_transform = new b2Transform();

    public m_count = 0;

    public ReportFixture(fixture: b2Fixture) {
        if (this.m_count === PolyShapesCallback.e_maxCount) {
            return false;
        }

        const body = fixture.GetBody();
        const shape = fixture.GetShape();

        const overlap = b2TestOverlapShape(shape, 0, this.m_circle, 0, body.GetTransform(), this.m_transform);

        if (overlap) {
            const color = new b2Color(0.95, 0.95, 0.6);
            const center = body.GetWorldCenter();
            g_debugDraw.DrawPoint(center, 5.0, color);
            ++this.m_count;
        }

        return true;
    }
}

export class PolyShapes extends Test {
    public static readonly e_maxBodies = 256;

    public m_bodyIndex = 0;

    public m_bodies: Array<b2Body | null> = Array.from({ length: PolyShapes.e_maxBodies }, () => null);

    public m_polygons = Array.from({ length: 4 }, () => new b2PolygonShape());

    public m_circle = new b2CircleShape();

    constructor() {
        super();

        // Ground body
        {
            const bd = new b2BodyDef();
            const ground = this.m_world.CreateBody(bd);

            const shape = new b2EdgeShape();
            shape.SetTwoSided(new b2Vec2(-40.0, 0.0), new b2Vec2(40.0, 0.0));
            ground.CreateFixture(shape, 0.0);
        }

        {
            const vertices = new Array(3);
            vertices[0] = new b2Vec2(-0.5, 0.0);
            vertices[1] = new b2Vec2(0.5, 0.0);
            vertices[2] = new b2Vec2(0.0, 1.5);
            this.m_polygons[0].Set(vertices, 3);
        }

        {
            const vertices = new Array(3);
            vertices[0] = new b2Vec2(-0.1, 0.0);
            vertices[1] = new b2Vec2(0.1, 0.0);
            vertices[2] = new b2Vec2(0.0, 1.5);
            this.m_polygons[1].Set(vertices, 3);
        }

        {
            const w = 1.0;
            const b = w / (2.0 + Math.sqrt(2.0));
            const s = Math.sqrt(2.0) * b;

            const vertices = new Array(8);
            vertices[0] = new b2Vec2(0.5 * s, 0.0);
            vertices[1] = new b2Vec2(0.5 * w, b);
            vertices[2] = new b2Vec2(0.5 * w, b + s);
            vertices[3] = new b2Vec2(0.5 * s, w);
            vertices[4] = new b2Vec2(-0.5 * s, w);
            vertices[5] = new b2Vec2(-0.5 * w, b + s);
            vertices[6] = new b2Vec2(-0.5 * w, b);
            vertices[7] = new b2Vec2(-0.5 * s, 0.0);

            this.m_polygons[2].Set(vertices, 8);
        }

        this.m_polygons[3].SetAsBox(0.5, 0.5);
        this.m_circle.m_radius = 0.5;

        for (let i = 0; i < PolyShapes.e_maxBodies; ++i) {
            this.m_bodies[i] = null;
        }
    }

    public CreateBody(index: number) {
        let body = this.m_bodies[this.m_bodyIndex];
        if (body) {
            this.m_world.DestroyBody(body);
            this.m_bodies[this.m_bodyIndex] = null;
        }

        const bd = new b2BodyDef();
        bd.type = b2BodyType.b2_dynamicBody;

        const x = b2RandomRange(-2.0, 2.0);
        bd.position.Set(x, 10.0);
        bd.angle = b2RandomRange(-Math.PI, Math.PI);

        if (index === 4) {
            bd.angularDamping = 0.02;
        }

        body = this.m_bodies[this.m_bodyIndex] = this.m_world.CreateBody(bd);

        if (index < 4) {
            const fd = new b2FixtureDef();
            fd.shape = this.m_polygons[index];
            fd.density = 1.0;
            fd.friction = 0.3;
            body.CreateFixture(fd);
        } else {
            const fd = new b2FixtureDef();
            fd.shape = this.m_circle;
            fd.density = 1.0;
            fd.friction = 0.3;

            body.CreateFixture(fd);
        }

        this.m_bodyIndex = (this.m_bodyIndex + 1) % PolyShapes.e_maxBodies;
    }

    public DestroyBody() {
        for (let i = 0; i < PolyShapes.e_maxBodies; ++i) {
            const body = this.m_bodies[i];
            if (body) {
                this.m_world.DestroyBody(body);
                this.m_bodies[i] = null;
                return;
            }
        }
    }

    getHotkeys(): HotKey[] {
        return [
            hotKeyPress([], "1", "Create Triangle", () => this.CreateBody(0)),
            hotKeyPress([], "2", "Create Flat Triangle", () => this.CreateBody(1)),
            hotKeyPress([], "3", "Create Octagon", () => this.CreateBody(2)),
            hotKeyPress([], "4", "Create Box", () => this.CreateBody(3)),
            hotKeyPress([], "5", "Create Circle", () => this.CreateBody(4)),
            hotKeyPress([], "a", "Toggle Enabled of Even Bodies", () => {
                for (let i = 0; i < PolyShapes.e_maxBodies; i += 2) {
                    const body = this.m_bodies[i];
                    if (body) {
                        body.SetEnabled(!body.IsEnabled());
                    }
                }
            }),
            hotKeyPress([], "d", "Destroy Body", () => this.DestroyBody()),
        ];
    }

    public Step(settings: Settings, timeStep: number): void {
        super.Step(settings, timeStep);

        const callback = new PolyShapesCallback();
        callback.m_circle.m_radius = 2.0;
        callback.m_circle.m_p.Set(0.0, 1.1);
        callback.m_transform.SetIdentity();

        const aabb = new b2AABB();
        callback.m_circle.ComputeAABB(aabb, callback.m_transform, 0);

        this.m_world.QueryAABB(aabb, callback);

        const color = new b2Color(0.4, 0.7, 0.8);
        g_debugDraw.DrawCircle(callback.m_circle.m_p, callback.m_circle.m_radius, color);
    }
}
