/*
 * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
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

// DEBUG: import { b2Assert } from "../common/b2_common";
import { b2_epsilon } from "../common/b2_common";
import { b2Color, b2Draw } from "../common/b2_draw";
import { b2Vec2, b2Transform, XY } from "../common/b2_math";
import { b2AABB, b2RayCastInput, b2RayCastOutput } from "./b2_collision";
import { b2DistanceProxy } from "./b2_distance";
import { b2MassData, b2Shape, b2ShapeType } from "./b2_shape";

/**
 * A solid circle shape
 */
export class b2CircleShape extends b2Shape {
    /** Position */
    public readonly m_p = new b2Vec2();

    constructor(radius = 0) {
        super(b2ShapeType.e_circle, radius);
    }

    public Set(position: XY, radius = this.m_radius) {
        this.m_p.Copy(position);
        this.m_radius = radius;
        return this;
    }

    /**
     * Implement b2Shape.
     */
    public Clone(): b2CircleShape {
        return new b2CircleShape().Copy(this);
    }

    public Copy(other: b2CircleShape): b2CircleShape {
        super.Copy(other);

        // DEBUG: b2Assert(other instanceof b2CircleShape);

        this.m_p.Copy(other.m_p);
        return this;
    }

    /**
     * @see b2Shape::GetChildCount
     */
    public GetChildCount(): number {
        return 1;
    }

    private static TestPoint_s_center = new b2Vec2();

    private static TestPoint_s_d = new b2Vec2();

    /**
     * Implement b2Shape.
     */
    public TestPoint(transform: b2Transform, p: XY): boolean {
        const center = b2Transform.MultiplyVec2(transform, this.m_p, b2CircleShape.TestPoint_s_center);
        const d = b2Vec2.Subtract(p, center, b2CircleShape.TestPoint_s_d);
        return b2Vec2.Dot(d, d) <= this.m_radius ** 2;
    }

    private static RayCast_s_position = new b2Vec2();

    private static RayCast_s_s = new b2Vec2();

    private static RayCast_s_r = new b2Vec2();

    /**
     * Implement b2Shape.
     *
     * @note because the circle is solid, rays that start inside do not hit because the normal is
     * not defined. Collision Detection in Interactive 3D Environments by Gino van den Bergen
     * From Section 3.1.2
     * x = s + a * r
     * norm(x) = radius
     */
    public RayCast(
        output: b2RayCastOutput,
        input: b2RayCastInput,
        transform: b2Transform,
        _childIndex: number,
    ): boolean {
        const position = b2Transform.MultiplyVec2(transform, this.m_p, b2CircleShape.RayCast_s_position);
        const s = b2Vec2.Subtract(input.p1, position, b2CircleShape.RayCast_s_s);
        const b = b2Vec2.Dot(s, s) - this.m_radius ** 2;

        // Solve quadratic equation.
        const r = b2Vec2.Subtract(input.p2, input.p1, b2CircleShape.RayCast_s_r);
        const c = b2Vec2.Dot(s, r);
        const rr = b2Vec2.Dot(r, r);
        const sigma = c * c - rr * b;

        // Check for negative discriminant and short segment.
        if (sigma < 0 || rr < b2_epsilon) {
            return false;
        }

        // Find the point of intersection of the line with the circle.
        let a = -(c + Math.sqrt(sigma));

        // Is the intersection point on the segment?
        if (a >= 0 && a <= input.maxFraction * rr) {
            a /= rr;
            output.fraction = a;
            b2Vec2.AddScaled(s, a, r, output.normal).Normalize();
            return true;
        }

        return false;
    }

    private static ComputeAABB_s_p = new b2Vec2();

    /**
     * @see b2Shape::ComputeAABB
     */
    public ComputeAABB(aabb: b2AABB, transform: b2Transform, _childIndex: number): void {
        const p = b2Transform.MultiplyVec2(transform, this.m_p, b2CircleShape.ComputeAABB_s_p);
        aabb.lowerBound.Set(p.x - this.m_radius, p.y - this.m_radius);
        aabb.upperBound.Set(p.x + this.m_radius, p.y + this.m_radius);
    }

    /**
     * @see b2Shape::ComputeMass
     */
    public ComputeMass(massData: b2MassData, density: number): void {
        const radius_sq = this.m_radius ** 2;
        massData.mass = density * Math.PI * radius_sq;
        massData.center.Copy(this.m_p);

        // inertia about the local origin
        massData.I = massData.mass * (0.5 * radius_sq + b2Vec2.Dot(this.m_p, this.m_p));
    }

    public SetupDistanceProxy(proxy: b2DistanceProxy, _index: number): void {
        proxy.m_vertices = proxy.m_buffer;
        proxy.m_vertices[0].Copy(this.m_p);
        proxy.m_count = 1;
        proxy.m_radius = this.m_radius;
    }

    public Draw(draw: b2Draw, color: b2Color): void {
        const center = this.m_p;
        const radius = this.m_radius;
        const axis = b2Vec2.UNITX;
        draw.DrawSolidCircle(center, radius, axis, color);
    }
}
