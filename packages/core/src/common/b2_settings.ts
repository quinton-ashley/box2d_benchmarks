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

export function b2Assert(condition: boolean, ...args: any[]): void {
    if (!condition) {
        // debugger;
        throw new Error(...args);
    }
}

export function b2Maybe<T>(value: T | undefined, def: T): T {
    return value !== undefined ? value : def;
}

export const b2_maxFloat = 1e37; // FLT_MAX instead of Number.MAX_VALUE;
export const b2_epsilon = 1e-5; // FLT_EPSILON instead of Number.MIN_VALUE;
export const b2_epsilon_sq: number = b2_epsilon * b2_epsilon;

/// @file
/// Global tuning constants based on meters-kilograms-seconds (MKS) units.
///

// Collision

/// The maximum number of contact points between two convex shapes. Do
/// not change this value.
export const b2_maxManifoldPoints = 2;

/// The maximum number of vertices on a convex polygon. You cannot increase
/// this too much because b2BlockAllocator has a maximum object size.
export const b2_maxPolygonVertices = 8;

/// This is used to fatten AABBs in the dynamic tree. This allows proxies
/// to move by a small amount without triggering a tree adjustment.
/// This is in meters.
export const b2_aabbExtension = 0.1;

/// This is used to fatten AABBs in the dynamic tree. This is used to predict
/// the future position based on the current displacement.
/// This is a dimensionless multiplier.
export const b2_aabbMultiplier = 4;

/// A small length used as a collision and constraint tolerance. Usually it is
/// chosen to be numerically significant, but visually insignificant.
export const b2_linearSlop = 0.008; // 0.005;

/// A small angle used as a collision and constraint tolerance. Usually it is
/// chosen to be numerically significant, but visually insignificant.
export const b2_angularSlop: number = (2 / 180) * Math.PI;

/// The radius of the polygon/edge shape skin. This should not be modified. Making
/// this smaller means polygons will have an insufficient buffer for continuous collision.
/// Making it larger may create artifacts for vertex collision.
export const b2_polygonRadius: number = 2 * b2_linearSlop;

/// Maximum number of sub-steps per contact in continuous physics simulation.
export const b2_maxSubSteps = 8;

// Dynamics

/// Maximum number of contacts to be handled to solve a TOI impact.
export const b2_maxTOIContacts = 32;

/// A velocity threshold for elastic collisions. Any collision with a relative linear
/// velocity below this threshold will be treated as inelastic.
export const b2_velocityThreshold = 1;

/// The maximum linear position correction used when solving constraints. This helps to
/// prevent overshoot.
export const b2_maxLinearCorrection = 0.2;

/// The maximum angular position correction used when solving constraints. This helps to
/// prevent overshoot.
export const b2_maxAngularCorrection: number = (8 / 180) * Math.PI;

/// The maximum linear velocity of a body. This limit is very large and is used
/// to prevent numerical problems. You shouldn't need to adjust this.
export const b2_maxTranslation = 2;
export const b2_maxTranslationSquared: number = b2_maxTranslation * b2_maxTranslation;

/// The maximum angular velocity of a body. This limit is very large and is used
/// to prevent numerical problems. You shouldn't need to adjust this.
export const b2_maxRotation: number = 0.5 * Math.PI;
export const b2_maxRotationSquared: number = b2_maxRotation * b2_maxRotation;

/// This scale factor controls how fast overlap is resolved. Ideally this would be 1 so
/// that overlap is removed in one time step. However using values close to 1 often lead
/// to overshoot.
export const b2_baumgarte = 0.2;
export const b2_toiBaumgarte = 0.75;

// Sleep

/// The time that a body must be still before it will go to sleep.
export const b2_timeToSleep = 0.5;

/// A body cannot sleep if its linear velocity is above this tolerance.
export const b2_linearSleepTolerance = 0.01;

/// A body cannot sleep if its angular velocity is above this tolerance.
export const b2_angularSleepTolerance: number = (2 / 180) * Math.PI;

// Memory Allocation

// FILE* b2_dumpFile = nullptr;

// void b2OpenDump(const char* fileName)
// {
// 	b2Assert(b2_dumpFile == nullptr);
// 	b2_dumpFile = fopen(fileName, "w");
// }

// void b2Dump(const char* string, ...)
// {
// 	if (b2_dumpFile == nullptr)
// 	{
// 		return;
// 	}

// 	va_list args;
// 	va_start(args, string);
// 	vfprintf(b2_dumpFile, string, args);
// 	va_end(args);
// }

// void b2CloseDump()
// {
// 	fclose(b2_dumpFile);
// 	b2_dumpFile = nullptr;
// }

/// Version numbering scheme.
/// See http://en.wikipedia.org/wiki/Software_versioning
export class b2Version {
    public major = 0; /// < significant changes

    public minor = 0; /// < incremental changes

    public revision = 0; /// < bug fixes

    constructor(major = 0, minor = 0, revision = 0) {
        this.major = major;
        this.minor = minor;
        this.revision = revision;
    }

    public toString(): string {
        return `${this.major}.${this.minor}.${this.revision}`;
    }
}

/// Current version.
export const b2_version: b2Version = new b2Version(2, 4, 0);

export const b2_branch = "master";
export const b2_commit = "4d7757feedc9dd36f64393ae08acfd3b9600ac17";

export function b2ParseInt(v: string): number {
    return parseInt(v, 10);
}

export function b2ParseUInt(v: string): number {
    return Math.abs(parseInt(v, 10));
}

export function b2MakeArray<T>(length: number, init: (i: number) => T): T[] {
    const a: T[] = new Array<T>(length);
    for (let i = 0; i < length; ++i) {
        a[i] = init(i);
    }
    return a;
}

export function b2MakeNullArray<T>(length: number): Array<T | null> {
    const a: Array<T | null> = new Array<T | null>(length);
    for (let i = 0; i < length; ++i) {
        a[i] = null;
    }
    return a;
}

export function b2MakeNumberArray(length: number, init = 0): number[] {
    const a: number[] = new Array<number>(length);
    for (let i = 0; i < length; ++i) {
        a[i] = init;
    }
    return a;
}
