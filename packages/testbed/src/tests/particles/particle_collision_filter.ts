/*
 * Copyright (c) 2015 Google, Inc.
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
    b2ContactFilter,
    b2Vec2,
    b2BodyDef,
    b2ChainShape,
    b2FixtureDef,
    b2PolygonShape,
    b2Vec2_zero,
    XY,
} from "@box2d/core";
import { b2ParticleGroupDef, b2ParticleFlag, b2ParticleGroup } from "@box2d/particles";

import { Test, RandomFloat } from "../../test";
import { Settings } from "../../settings";
import { hotKeyPress, HotKey } from "../../utils/hotkeys";

// Optionally disables particle / fixture and particle / particle contacts.
export class ParticleContactDisabler extends b2ContactFilter {
    public m_enableFixtureParticleCollisions = true;

    public m_enableParticleParticleCollisions = true;

    // Blindly enable / disable collisions between fixtures and particles.
    public ShouldCollideFixtureParticle(): boolean {
        return this.m_enableFixtureParticleCollisions;
    }

    // Blindly enable / disable collisions between particles.
    public ShouldCollideParticleParticle(): boolean {
        return this.m_enableParticleParticleCollisions;
    }
}

export class ParticleCollisionFilter extends Test {
    constructor() {
        super(b2Vec2_zero);

        // must also set b2_particleContactFilterParticle and
        // b2_fixtureContactFilterParticle flags for particle group
        this.m_world.SetContactFilter(this.m_contactDisabler);

        // Create the container.
        {
            const bd = new b2BodyDef();
            const ground = this.m_world.CreateBody(bd);
            const shape = new b2ChainShape();
            const vertices: b2Vec2[] = [
                new b2Vec2(
                    -ParticleCollisionFilter.kBoxSize,
                    -ParticleCollisionFilter.kBoxSize + ParticleCollisionFilter.kOffset
                ),
                new b2Vec2(
                    ParticleCollisionFilter.kBoxSize,
                    -ParticleCollisionFilter.kBoxSize + ParticleCollisionFilter.kOffset
                ),
                new b2Vec2(
                    ParticleCollisionFilter.kBoxSize,
                    ParticleCollisionFilter.kBoxSize + ParticleCollisionFilter.kOffset
                ),
                new b2Vec2(
                    -ParticleCollisionFilter.kBoxSize,
                    ParticleCollisionFilter.kBoxSize + ParticleCollisionFilter.kOffset
                ),
            ];
            shape.CreateLoop(vertices);
            const def = new b2FixtureDef();
            def.shape = shape;
            def.density = 0;
            def.density = 0;
            def.restitution = 1.0;
            ground.CreateFixture(def);
        }

        // create the particles
        this.m_particleSystem.SetRadius(0.5);
        {
            // b2PolygonShape shape;
            const shape = new b2PolygonShape();
            // shape.SetAsBox(1.5f, 1.5f, b2Vec2(kBoxSizeHalf, kBoxSizeHalf + kOffset), 0.0f);
            shape.SetAsBox(
                1.5,
                1.5,
                new b2Vec2(
                    ParticleCollisionFilter.kBoxSizeHalf,
                    ParticleCollisionFilter.kBoxSizeHalf + ParticleCollisionFilter.kOffset
                ),
                0.0
            );
            // b2ParticleGroupDef pd;
            const pd = new b2ParticleGroupDef();
            // pd.shape = &shape;
            pd.shape = shape;
            // pd.flags = b2_powderParticle
            // 		| b2_particleContactFilterParticle
            // 		| b2_fixtureContactFilterParticle;
            pd.flags =
                b2ParticleFlag.b2_powderParticle |
                b2ParticleFlag.b2_particleContactFilterParticle |
                b2ParticleFlag.b2_fixtureContactFilterParticle;
            // m_particleGroup =
            // 	m_particleSystem.CreateParticleGroup(pd);
            this.m_particleGroup = this.m_particleSystem.CreateParticleGroup(pd);

            // b2Vec2* velocities =
            // 	m_particleSystem.GetVelocityBuffer() +
            // 	m_particleGroup.GetBufferIndex();
            const velocities: b2Vec2[] = this.m_particleSystem.GetVelocityBuffer();
            const index: number = this.m_particleGroup.GetBufferIndex();
            // for (int i = 0; i < m_particleGroup.GetParticleCount(); ++i) {
            // 	b2Vec2& v = *(velocities + i);
            // 	v.Set(RandomFloat(), RandomFloat());
            // 	v.Normalize();
            // 	v *= kSpeedup;
            // }
            for (let i = 0; i < this.m_particleGroup.GetParticleCount(); ++i) {
                const v: b2Vec2 = velocities[index + i];
                v.Set(RandomFloat(), RandomFloat());
                v.SelfNormalize();
                v.SelfMul(ParticleCollisionFilter.kSpeedup);
            }
        }
    }

    public Step(settings: Settings, timeStep: number): void {
        super.Step(settings, timeStep);

        // const int32 index = m_particleGroup.GetBufferIndex();
        const index: number = this.m_particleGroup.GetBufferIndex();
        // b2Vec2* const velocities =
        // 	m_particleSystem.GetVelocityBuffer() + index;
        const velocities: b2Vec2[] = this.m_particleSystem.GetVelocityBuffer();
        // for (int32 i = 0; i < m_particleGroup.GetParticleCount(); i++) {
        // 	// Add energy to particles based upon the temperature.
        // 	b2Vec2& v = velocities[i];
        // 	v.Normalize();
        // 	v *= kSpeedup;
        // }
        for (let i = 0; i < this.m_particleGroup.GetParticleCount(); ++i) {
            const v: b2Vec2 = velocities[index + i];
            v.SelfNormalize();
            v.SelfMul(ParticleCollisionFilter.kSpeedup);
        }
    }

    public getCenter(): XY {
        return {
            x: 0,
            y: 20,
        };
    }

    getHotkeys(): HotKey[] {
        return [
            hotKeyPress([], "a", "Toggle Fixture Collisions", () => this.ToggleFixtureCollisions()),
            hotKeyPress([], "s", "Toggle Particle Collisions", () => this.ToggleParticleCollisions()),
        ];
    }

    public ToggleFixtureCollisions(): void {
        this.m_contactDisabler.m_enableFixtureParticleCollisions = !this.m_contactDisabler
            .m_enableFixtureParticleCollisions;
    }

    public ToggleParticleCollisions(): void {
        this.m_contactDisabler.m_enableParticleParticleCollisions = !this.m_contactDisabler
            .m_enableParticleParticleCollisions;
    }

    public m_contactDisabler: ParticleContactDisabler = new ParticleContactDisabler();

    public m_particleGroup: b2ParticleGroup;

    public static readonly kBoxSize = 10.0;

    public static readonly kBoxSizeHalf = ParticleCollisionFilter.kBoxSize / 2;

    public static readonly kOffset = 20.0;

    public static readonly kParticlesContainerSize = ParticleCollisionFilter.kOffset + 0.5;

    public static readonly kSpeedup = 8.0;
}
