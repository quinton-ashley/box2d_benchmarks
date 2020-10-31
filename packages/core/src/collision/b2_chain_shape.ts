/*
 * Copyright (c) 2006-2010 Erin Catto http://www.box2d.org
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

// DEBUG: import { b2Assert, b2_linearSlop } from "../common/b2_common";
import { b2Assert, b2_polygonRadius } from "../common/b2_common";
import { b2Vec2, b2Transform, XY } from "../common/b2_math";
import { b2AABB, b2RayCastInput, b2RayCastOutput } from "./b2_collision";
import { b2DistanceProxy } from "./b2_distance";
import { b2MassData, b2Shape, b2ShapeType } from "./b2_shape";
import { b2EdgeShape } from "./b2_edge_shape";

/// A chain shape is a free form sequence of line segments.
/// The chain has one-sided collision, with the surface normal pointing to the right of the edge.
/// This provides a counter-clockwise winding like the polygon shape.
/// Connectivity information is used to create smooth collisions.
/// @warning the chain will not collide properly if there are self-intersections.
export class b2ChainShape extends b2Shape {
    public m_vertices: b2Vec2[] = [];

    public readonly m_prevVertex: b2Vec2 = new b2Vec2();

    public readonly m_nextVertex: b2Vec2 = new b2Vec2();

    constructor() {
        super(b2ShapeType.e_chain, b2_polygonRadius);
    }

    /// Create a loop. This automatically adjusts connectivity.
    /// @param vertices an array of vertices, these are copied
    /// @param count the vertex count
    public CreateLoop(vertices: XY[]): b2ChainShape;

    public CreateLoop(vertices: XY[], count: number): b2ChainShape;

    public CreateLoop(vertices: number[]): b2ChainShape;

    public CreateLoop(...args: any[]): b2ChainShape {
        if (typeof args[0][0] === "number") {
            const vertices: number[] = args[0];
            b2Assert(vertices.length % 2 === 0);
            return this.CreateLoopEx(
                (index) => ({ x: vertices[index * 2], y: vertices[index * 2 + 1] }),
                vertices.length / 2,
            );
        }
        const vertices: XY[] = args[0];
        const count: number = args[1] || vertices.length;
        return this.CreateLoopEx((index) => vertices[index], count);
    }

    private CreateLoopEx(vertices: (index: number) => XY, count: number): b2ChainShape {
        // DEBUG: b2Assert(count >= 3);
        if (count < 3) {
            return this;
        }
        // DEBUG: for (let i: number = 1; i < count; ++i) {
        // DEBUG:   const v1 = vertices[start + i - 1];
        // DEBUG:   const v2 = vertices[start + i];
        // DEBUG:   // If the code crashes here, it means your vertices are too close together.
        // DEBUG:   b2Assert(b2Vec2.DistanceSquared(v1, v2) > b2_linearSlop * b2_linearSlop);
        // DEBUG: }

        this.m_vertices.length = count + 1;
        for (let i = 0; i < count; ++i) {
            const { x, y } = vertices(i);
            this.m_vertices[i] = new b2Vec2(x, y);
        }
        this.m_vertices[count] = this.m_vertices[0].Clone();
        this.m_prevVertex.Copy(this.m_vertices[this.m_vertices.length - 2]);
        this.m_nextVertex.Copy(this.m_vertices[1]);
        return this;
    }

    /// Create a chain with ghost vertices to connect multiple chains together.
    /// @param vertices an array of vertices, these are copied
    /// @param count the vertex count
    /// @param prevVertex previous vertex from chain that connects to the start
    /// @param nextVertex next vertex from chain that connects to the end
    public CreateChain(vertices: XY[], prevVertex: Readonly<XY>, nextVertex: Readonly<XY>): b2ChainShape;

    public CreateChain(vertices: XY[], count: number, prevVertex: Readonly<XY>, nextVertex: Readonly<XY>): b2ChainShape;

    public CreateChain(vertices: number[], prevVertex: Readonly<XY>, nextVertex: Readonly<XY>): b2ChainShape;

    public CreateChain(...args: any[]): b2ChainShape {
        if (typeof args[0][0] === "number") {
            const vertices: number[] = args[0];
            const prevVertex: Readonly<XY> = args[1];
            const nextVertex: Readonly<XY> = args[2];
            b2Assert(vertices.length % 2 === 0);
            return this.CreateChainEx(
                (index) => ({ x: vertices[index * 2], y: vertices[index * 2 + 1] }),
                vertices.length / 2,
                prevVertex,
                nextVertex,
            );
        }
        const vertices: XY[] = args[0];
        const count: number = args[1] || vertices.length;
        const prevVertex: Readonly<XY> = args[2];
        const nextVertex: Readonly<XY> = args[3];
        return this.CreateChainEx((index) => vertices[index], count, prevVertex, nextVertex);
    }

    private CreateChainEx(
        vertices: (index: number) => XY,
        count: number,
        prevVertex: Readonly<XY>,
        nextVertex: Readonly<XY>,
    ): b2ChainShape {
        // DEBUG: b2Assert(count >= 2);
        // DEBUG: for (let i: number = 1; i < count; ++i) {
        // DEBUG:   const v1 = vertices[start + i - 1];
        // DEBUG:   const v2 = vertices[start + i];
        // DEBUG:   // If the code crashes here, it means your vertices are too close together.
        // DEBUG:   b2Assert(b2Vec2.DistanceSquared(v1, v2) > b2_linearSlop * b2_linearSlop);
        // DEBUG: }

        this.m_vertices.length = count;
        for (let i = 0; i < count; ++i) {
            const { x, y } = vertices(i);
            this.m_vertices[i] = new b2Vec2(x, y);
        }

        this.m_prevVertex.Copy(prevVertex);
        this.m_nextVertex.Copy(nextVertex);

        return this;
    }

    /// Implement b2Shape. Vertices are cloned using b2Alloc.
    public Clone(): b2ChainShape {
        return new b2ChainShape().Copy(this);
    }

    public Copy(other: b2ChainShape): b2ChainShape {
        super.Copy(other);

        // DEBUG: b2Assert(other instanceof b2ChainShape);

        return this.CreateChainEx(
            (index) => other.m_vertices[index],
            other.m_vertices.length,
            other.m_prevVertex,
            other.m_nextVertex,
        );
    }

    /// @see b2Shape::GetChildCount
    public GetChildCount(): number {
        // edge count = vertex count - 1
        return this.m_vertices.length - 1;
    }

    /// Get a child edge.
    public GetChildEdge(edge: b2EdgeShape, index: number): void {
        // DEBUG: b2Assert(0 <= index && index < this.m_vertices.length - 1);
        edge.m_radius = this.m_radius;

        edge.m_vertex1.Copy(this.m_vertices[index]);
        edge.m_vertex2.Copy(this.m_vertices[index + 1]);
        edge.m_oneSided = true;

        if (index > 0) {
            edge.m_vertex0.Copy(this.m_vertices[index - 1]);
        } else {
            edge.m_vertex0.Copy(this.m_prevVertex);
        }

        if (index < this.m_vertices.length - 2) {
            edge.m_vertex3.Copy(this.m_vertices[index + 2]);
        } else {
            edge.m_vertex3.Copy(this.m_nextVertex);
        }
    }

    /// This always return false.
    /// @see b2Shape::TestPoint
    public TestPoint(_xf: b2Transform, _p: XY): boolean {
        return false;
    }

    /// Implement b2Shape.
    private static RayCast_s_edgeShape = new b2EdgeShape();

    public RayCast(output: b2RayCastOutput, input: b2RayCastInput, xf: b2Transform, childIndex: number): boolean {
        // DEBUG: b2Assert(childIndex < this.m_vertices.length);

        const edgeShape: b2EdgeShape = b2ChainShape.RayCast_s_edgeShape;

        edgeShape.m_vertex1.Copy(this.m_vertices[childIndex]);
        edgeShape.m_vertex2.Copy(this.m_vertices[(childIndex + 1) % this.m_vertices.length]);

        return edgeShape.RayCast(output, input, xf, 0);
    }

    /// @see b2Shape::ComputeAABB
    private static ComputeAABB_s_v1 = new b2Vec2();

    private static ComputeAABB_s_v2 = new b2Vec2();

    private static ComputeAABB_s_lower = new b2Vec2();

    private static ComputeAABB_s_upper = new b2Vec2();

    public ComputeAABB(aabb: b2AABB, xf: b2Transform, childIndex: number): void {
        // DEBUG: b2Assert(childIndex < this.m_vertices.length);

        const vertexi1: b2Vec2 = this.m_vertices[childIndex];
        const vertexi2: b2Vec2 = this.m_vertices[(childIndex + 1) % this.m_vertices.length];

        const v1: b2Vec2 = b2Transform.MultiplyVec2(xf, vertexi1, b2ChainShape.ComputeAABB_s_v1);
        const v2: b2Vec2 = b2Transform.MultiplyVec2(xf, vertexi2, b2ChainShape.ComputeAABB_s_v2);

        const lower: b2Vec2 = b2Vec2.Min(v1, v2, b2ChainShape.ComputeAABB_s_lower);
        const upper: b2Vec2 = b2Vec2.Max(v1, v2, b2ChainShape.ComputeAABB_s_upper);

        aabb.lowerBound.x = lower.x - this.m_radius;
        aabb.lowerBound.y = lower.y - this.m_radius;
        aabb.upperBound.x = upper.x + this.m_radius;
        aabb.upperBound.y = upper.y + this.m_radius;
    }

    /// Chains have zero mass.
    /// @see b2Shape::ComputeMass
    public ComputeMass(massData: b2MassData, _density: number): void {
        massData.mass = 0;
        massData.center.SetZero();
        massData.I = 0;
    }

    public SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void {
        // DEBUG: b2Assert(0 <= index && index < this.m_vertices.length);

        proxy.m_vertices = proxy.m_buffer;
        proxy.m_vertices[0].Copy(this.m_vertices[index]);
        if (index + 1 < this.m_vertices.length) {
            proxy.m_vertices[1].Copy(this.m_vertices[index + 1]);
        } else {
            proxy.m_vertices[1].Copy(this.m_vertices[0]);
        }
        proxy.m_count = 2;
        proxy.m_radius = this.m_radius;
    }
}
