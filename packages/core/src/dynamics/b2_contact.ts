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

import { b2Assert } from "../common/b2_common";
import { b2Transform } from "../common/b2_math";
import { b2Manifold, b2WorldManifold, b2TestOverlap } from "../collision/b2_collision";
import { b2Body } from "./b2_body";
import { b2Fixture } from "./b2_fixture";
import { b2Shape } from "../collision/b2_shape";
import type { b2ContactListener } from "./b2_world_callbacks";

/**
 * Friction mixing law. The idea is to allow either fixture to drive the friction to zero.
 * For example, anything slides on ice.
 */
export function b2MixFriction(friction1: number, friction2: number): number {
    return Math.sqrt(friction1 * friction2);
}

/**
 * Restitution mixing law. The idea is allow for anything to bounce off an inelastic surface.
 * For example, a superball bounces on anything.
 */
export function b2MixRestitution(restitution1: number, restitution2: number): number {
    return restitution1 > restitution2 ? restitution1 : restitution2;
}

/**
 * Restitution mixing law. This picks the lowest value.
 */
export function b2MixRestitutionThreshold(threshold1: number, threshold2: number) {
    return threshold1 < threshold2 ? threshold1 : threshold2;
}

/**
 * A contact edge is used to connect bodies and contacts together
 * in a contact graph where each body is a node and each contact
 * is an edge. A contact edge belongs to a doubly linked list
 * maintained in each attached body. Each contact has two contact
 * nodes, one for each attached body.
 */
export class b2ContactEdge {
    /** Provides quick access to the other body attached. */
    private m_other: b2Body | null = null;

    public get other(): b2Body {
        b2Assert(this.m_other !== null);
        return this.m_other;
    }

    public set other(value: b2Body) {
        b2Assert(this.m_other === null);
        this.m_other = value;
    }

    /** The contact */
    public readonly contact: b2Contact;

    /** The previous contact edge in the body's contact list */
    public prev: b2ContactEdge | null = null;

    /** The next contact edge in the body's contact list */
    public next: b2ContactEdge | null = null;

    public constructor(contact: b2Contact) {
        this.contact = contact;
    }

    public Reset(): void {
        this.m_other = null;
        this.prev = null;
        this.next = null;
    }
}

/**
 * The class manages contact between two shapes. A contact exists for each overlapping
 * AABB in the broad-phase (except if filtered). Therefore a contact object may exist
 * that has no contact points.
 */
export abstract class b2Contact<A extends b2Shape = b2Shape, B extends b2Shape = b2Shape> {
    /** Used when crawling contact graph when forming islands. */
    public m_islandFlag = false;

    /** Set when the shapes are touching. */
    public m_touchingFlag = false;

    /** This contact can be disabled (by user) */
    public m_enabledFlag = false;

    /** This contact needs filtering because a fixture filter was changed. */
    public m_filterFlag = false;

    /** This bullet contact had a TOI event */
    public m_bulletHitFlag = false;

    /** This contact has a valid TOI in m_toi */
    public m_toiFlag = false;

    // World pool and list pointers.
    public m_prev: b2Contact | null = null;

    public m_next: b2Contact | null = null;

    // Nodes for connecting bodies.
    public readonly m_nodeA: b2ContactEdge = new b2ContactEdge(this);

    public readonly m_nodeB: b2ContactEdge = new b2ContactEdge(this);

    public m_fixtureA!: b2Fixture;

    public m_fixtureB!: b2Fixture;

    public m_indexA = 0;

    public m_indexB = 0;

    public m_manifold = new b2Manifold(); // TODO: readonly

    public m_toiCount = 0;

    public m_toi = 0;

    public m_friction = 0;

    public m_restitution = 0;

    public m_restitutionThreshold = 0;

    public m_tangentSpeed = 0;

    public m_oldManifold = new b2Manifold(); // TODO: readonly

    public GetManifold() {
        return this.m_manifold;
    }

    public GetWorldManifold(worldManifold: b2WorldManifold): void {
        const bodyA = this.m_fixtureA.GetBody();
        const bodyB = this.m_fixtureB.GetBody();
        const shapeA = this.GetShapeA();
        const shapeB = this.GetShapeB();
        worldManifold.Initialize(
            this.m_manifold,
            bodyA.GetTransform(),
            shapeA.m_radius,
            bodyB.GetTransform(),
            shapeB.m_radius,
        );
    }

    public IsTouching(): boolean {
        return this.m_touchingFlag;
    }

    public SetEnabled(flag: boolean): void {
        this.m_enabledFlag = flag;
    }

    public IsEnabled(): boolean {
        return this.m_enabledFlag;
    }

    public GetNext(): b2Contact | null {
        return this.m_next;
    }

    public GetFixtureA(): b2Fixture {
        return this.m_fixtureA;
    }

    public GetChildIndexA(): number {
        return this.m_indexA;
    }

    public GetShapeA(): A {
        return this.m_fixtureA.GetShape() as A;
    }

    public GetFixtureB(): b2Fixture {
        return this.m_fixtureB;
    }

    public GetChildIndexB(): number {
        return this.m_indexB;
    }

    public GetShapeB(): B {
        return this.m_fixtureB.GetShape() as B;
    }

    public abstract Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;

    public FlagForFiltering(): void {
        this.m_filterFlag = true;
    }

    public SetFriction(friction: number): void {
        this.m_friction = friction;
    }

    public GetFriction(): number {
        return this.m_friction;
    }

    public ResetFriction(): void {
        this.m_friction = b2MixFriction(this.m_fixtureA.m_friction, this.m_fixtureB.m_friction);
    }

    public SetRestitution(restitution: number): void {
        this.m_restitution = restitution;
    }

    public GetRestitution(): number {
        return this.m_restitution;
    }

    public ResetRestitution(): void {
        this.m_restitution = b2MixRestitution(this.m_fixtureA.m_restitution, this.m_fixtureB.m_restitution);
    }

    /**
     * Override the default restitution velocity threshold mixture. You can call this in b2ContactListener::PreSolve.
     * The value persists until you set or reset.
     */
    public SetRestitutionThreshold(threshold: number) {
        this.m_restitutionThreshold = threshold;
    }

    /**
     * Get the restitution threshold.
     */
    public GetRestitutionThreshold() {
        return this.m_restitutionThreshold;
    }

    /**
     * Reset the restitution threshold to the default value.
     */
    public ResetRestitutionThreshold() {
        this.m_restitutionThreshold = b2MixRestitutionThreshold(
            this.m_fixtureA.m_restitutionThreshold,
            this.m_fixtureB.m_restitutionThreshold,
        );
    }

    public SetTangentSpeed(speed: number): void {
        this.m_tangentSpeed = speed;
    }

    public GetTangentSpeed(): number {
        return this.m_tangentSpeed;
    }

    public Reset(fixtureA: b2Fixture, indexA: number, fixtureB: b2Fixture, indexB: number): void {
        this.m_islandFlag = false;
        this.m_touchingFlag = false;
        this.m_enabledFlag = true;
        this.m_filterFlag = false;
        this.m_bulletHitFlag = false;
        this.m_toiFlag = false;

        this.m_fixtureA = fixtureA;
        this.m_fixtureB = fixtureB;

        this.m_indexA = indexA;
        this.m_indexB = indexB;

        this.m_manifold.pointCount = 0;

        this.m_prev = null;
        this.m_next = null;

        this.m_nodeA.Reset();
        this.m_nodeB.Reset();

        this.m_toiCount = 0;

        this.m_friction = b2MixFriction(this.m_fixtureA.m_friction, this.m_fixtureB.m_friction);
        this.m_restitution = b2MixRestitution(this.m_fixtureA.m_restitution, this.m_fixtureB.m_restitution);
        this.m_restitutionThreshold = b2MixRestitutionThreshold(
            this.m_fixtureA.m_restitutionThreshold,
            this.m_fixtureB.m_restitutionThreshold,
        );
    }

    public Update(listener: b2ContactListener): void {
        const tManifold = this.m_oldManifold;
        this.m_oldManifold = this.m_manifold;
        this.m_manifold = tManifold;

        // Re-enable this contact.
        this.m_enabledFlag = true;

        let touching = false;
        const wasTouching = this.m_touchingFlag;

        const sensorA = this.m_fixtureA.IsSensor();
        const sensorB = this.m_fixtureB.IsSensor();
        const sensor = sensorA || sensorB;

        const bodyA = this.m_fixtureA.GetBody();
        const bodyB = this.m_fixtureB.GetBody();
        const xfA = bodyA.GetTransform();
        const xfB = bodyB.GetTransform();

        // Is this contact a sensor?
        if (sensor) {
            const shapeA = this.GetShapeA();
            const shapeB = this.GetShapeB();
            touching = b2TestOverlap(shapeA, this.m_indexA, shapeB, this.m_indexB, xfA, xfB);

            // Sensors don't generate manifolds.
            this.m_manifold.pointCount = 0;
        } else {
            this.Evaluate(this.m_manifold, xfA, xfB);
            touching = this.m_manifold.pointCount > 0;

            // Match old contact ids to new contact ids and copy the
            // stored impulses to warm start the solver.
            for (let i = 0; i < this.m_manifold.pointCount; ++i) {
                const mp2 = this.m_manifold.points[i];
                mp2.normalImpulse = 0;
                mp2.tangentImpulse = 0;
                const id2 = mp2.id;

                for (let j = 0; j < this.m_oldManifold.pointCount; ++j) {
                    const mp1 = this.m_oldManifold.points[j];

                    if (mp1.id.key === id2.key) {
                        mp2.normalImpulse = mp1.normalImpulse;
                        mp2.tangentImpulse = mp1.tangentImpulse;
                        break;
                    }
                }
            }

            if (touching !== wasTouching) {
                bodyA.SetAwake(true);
                bodyB.SetAwake(true);
            }
        }

        this.m_touchingFlag = touching;

        if (!wasTouching && touching && listener) {
            listener.BeginContact(this);
        }

        if (wasTouching && !touching && listener) {
            listener.EndContact(this);
        }

        if (!sensor && touching && listener) {
            listener.PreSolve(this, this.m_oldManifold);
        }
    }
}
