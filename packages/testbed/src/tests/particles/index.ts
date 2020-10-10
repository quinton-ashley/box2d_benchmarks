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

import { TestEntry } from "../../test";
import { Sandbox } from "./sandbox";
import { Sparky } from "./sparky";
import { DamBreak } from "./dam_break";
import { LiquidTimer } from "./liquid_timer";
import { WaveMachine } from "./wave_machine";
import { Particles } from "./particles";
import { Faucet } from "./faucet";
import { DrawingParticles } from "./drawing_particles";
import { Soup } from "./soup";
import { ParticlesSurfaceTension } from "./particles_surface_tension";
import { ElasticParticles } from "./elastic_particles";
import { RigidParticles } from "./rigid_particles";
import { MultipleParticleSystems } from "./multiple_particle_systems";
import { Impulse } from "./impulse";
import { SoupStirrer } from "./soup_stirrer";
import { Fracker } from "./fracker";
import { Maxwell } from "./maxwell";
import { Ramp } from "./ramp";
import { Pointy } from "./pointy";
import { AntiPointy } from "./anti_pointy";
import { CornerCase } from "./corner_case";
import { ParticleCollisionFilter } from "./particle_collision_filter";
import { EyeCandy } from "./eye_candy";

export const particleTests: TestEntry[] = [
    ["AntiPointy", AntiPointy],
    ["Corner Case", CornerCase],
    ["DamBreak", DamBreak],
    ["Elastic Particles", ElasticParticles],
    ["Eye Candy", EyeCandy],
    ["Faucet", Faucet],
    ["Fracker", Fracker],
    ["Impulse", Impulse],
    ["Liquid Timer", LiquidTimer],
    ["Maxwell", Maxwell],
    ["Multiple Systems", MultipleParticleSystems],
    ["Particle Collisions", ParticleCollisionFilter],
    ["Particle Drawing", DrawingParticles],
    ["Particles", Particles],
    ["Pointy", Pointy],
    ["Ramp", Ramp],
    ["Rigid Particles", RigidParticles],
    ["Sandbox", Sandbox],
    ["Soup Stirrer", SoupStirrer],
    ["Soup", Soup],
    ["Sparky", Sparky],
    ["Surface Tension", ParticlesSurfaceTension],
    ["Wave Machine", WaveMachine],
];
