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

import { b2_lengthUnitsPerMeter } from "./b2_settings";

export function b2Assert(condition: boolean, message?: string): asserts condition {
    if (!condition) throw new Error(message);
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

/// This is used to fatten AABBs in the dynamic tree. This allows proxies
/// to move by a small amount without triggering a tree adjustment.
/// This is in meters.
export const b2_aabbExtension = 0.1 * b2_lengthUnitsPerMeter;

/// This is used to fatten AABBs in the dynamic tree. This is used to predict
/// the future position based on the current displacement.
/// This is a dimensionless multiplier.
export const b2_aabbMultiplier = 4;

/// A small length used as a collision and constraint tolerance. Usually it is
/// chosen to be numerically significant, but visually insignificant.
export const b2_linearSlop = 0.005 * b2_lengthUnitsPerMeter;

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

/// The maximum linear position correction used when solving constraints. This helps to
/// prevent overshoot. Meters.
export const b2_maxLinearCorrection = 0.2 * b2_lengthUnitsPerMeter;

/// The maximum angular position correction used when solving constraints. This helps to
/// prevent overshoot.
export const b2_maxAngularCorrection: number = (8 / 180) * Math.PI;

/// The maximum linear translation of a body per step. This limit is very large and is used
/// to prevent numerical problems. You shouldn't need to adjust this. Meters.
export const b2_maxTranslation = 2 * b2_lengthUnitsPerMeter;
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
export const b2_linearSleepTolerance = 0.01 * b2_lengthUnitsPerMeter;

/// A body cannot sleep if its angular velocity is above this tolerance.
export const b2_angularSleepTolerance: number = (2 / 180) * Math.PI;

/// Current version.
/// See http://en.wikipedia.org/wiki/Software_versioning
export const b2_version = {
    major: 2,
    minor: 4,
    patch: 0,
};

export function b2MakeNumberArray(length: number, init = 0): number[] {
    return Array.from({ length }, () => init);
}
