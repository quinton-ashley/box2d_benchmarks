// MIT License

// Copyright (c) 2019 Erin Catto

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { b2MakeNumberArray } from "../common/b2_common";
import { b2Vec2 } from "../common/b2_math";

const temp = {
    J1: new b2Vec2(),
    J2: new b2Vec2(),
    J3: new b2Vec2(),
    r: new b2Vec2(),
    e1: new b2Vec2(),
    e2: new b2Vec2(),
    Jd1: new b2Vec2(),
    Jd2: new b2Vec2(),
    p1: new b2Vec2(),
    p2: new b2Vec2(),
    p3: new b2Vec2(),
    d: new b2Vec2(),
    u: new b2Vec2(),
    dp1: new b2Vec2(),
    dp2: new b2Vec2(),
    dp3: new b2Vec2(),
    d1: new b2Vec2(),
    d2: new b2Vec2(),
    dHat: new b2Vec2(),
};

export enum b2StretchingModel {
    b2_pbdStretchingModel,
    b2_xpbdStretchingModel,
}

export enum b2BendingModel {
    b2_springAngleBendingModel = 0,
    b2_pbdAngleBendingModel,
    b2_xpbdAngleBendingModel,
    b2_pbdDistanceBendingModel,
    b2_pbdHeightBendingModel,
    b2_pbdTriangleBendingModel,
}

///
export class b2RopeTuning {
    public stretchingModel: b2StretchingModel = b2StretchingModel.b2_pbdStretchingModel;

    public bendingModel: b2BendingModel = b2BendingModel.b2_pbdAngleBendingModel;

    public damping = 0.0;

    public stretchStiffness = 1.0;

    public stretchHertz = 0.0;

    public stretchDamping = 0.0;

    public bendStiffness = 0.5;

    public bendHertz = 1.0;

    public bendDamping = 0.0;

    public isometric = false;

    public fixedEffectiveMass = false;

    public warmStart = false;

    public Copy(other: Readonly<b2RopeTuning>) {
        this.stretchingModel = other.stretchingModel;
        this.bendingModel = other.bendingModel;
        this.damping = other.damping;
        this.stretchStiffness = other.stretchStiffness;
        this.stretchHertz = other.stretchHertz;
        this.stretchDamping = other.stretchDamping;
        this.bendStiffness = other.bendStiffness;
        this.bendHertz = other.bendHertz;
        this.bendDamping = other.bendDamping;
        this.isometric = other.isometric;
        this.fixedEffectiveMass = other.fixedEffectiveMass;
        this.warmStart = other.warmStart;
        return this;
    }
}

///
export class b2RopeDef {
    public readonly position: b2Vec2 = new b2Vec2();

    // b2Vec2* vertices;
    public readonly vertices: b2Vec2[] = [];

    // int32 count;
    public count = 0;

    // float* masses;
    public readonly masses: number[] = [];

    // b2Vec2 gravity;
    public readonly gravity: b2Vec2 = new b2Vec2();

    // b2RopeTuning tuning;
    public readonly tuning: b2RopeTuning = new b2RopeTuning();
}

class b2RopeStretch {
    public i1 = 0;

    public i2 = 0;

    public invMass1 = 0.0;

    public invMass2 = 0.0;

    public L = 0.0;

    public lambda = 0.0;

    public spring = 0.0;

    public damper = 0.0;
}

class b2RopeBend {
    public i1 = 0;

    public i2 = 0;

    public i3 = 0;

    public invMass1 = 0.0;

    public invMass2 = 0.0;

    public invMass3 = 0.0;

    public invEffectiveMass = 0.0;

    public lambda = 0.0;

    public L1 = 0.0;

    public L2 = 0.0;

    public alpha1 = 0.0;

    public alpha2 = 0.0;

    public spring = 0.0;

    public damper = 0.0;
}

///
export class b2Rope {
    private readonly m_position: b2Vec2 = new b2Vec2();

    private m_count = 0;

    private m_stretchCount = 0;

    private m_bendCount = 0;

    private readonly m_stretchConstraints: b2RopeStretch[];

    private readonly m_bendConstraints: b2RopeBend[];

    private readonly m_bindPositions: b2Vec2[];

    private readonly m_ps: b2Vec2[];

    private readonly m_p0s: b2Vec2[];

    private readonly m_vs: b2Vec2[];

    private readonly m_invMasses: number[] = [];

    private readonly m_gravity: b2Vec2 = new b2Vec2();

    private readonly m_tuning: b2RopeTuning = new b2RopeTuning();

    public constructor(def: b2RopeDef) {
        // b2Assert(def.count >= 3);
        this.m_position.Copy(def.position);
        this.m_count = def.count;
        this.m_bindPositions = b2Vec2.MakeArray(this.m_count);
        this.m_ps = b2Vec2.MakeArray(this.m_count);
        this.m_p0s = b2Vec2.MakeArray(this.m_count);
        this.m_vs = b2Vec2.MakeArray(this.m_count);
        this.m_invMasses = b2MakeNumberArray(this.m_count);

        for (let i = 0; i < this.m_count; ++i) {
            this.m_bindPositions[i].Copy(def.vertices[i]);
            // this.m_ps[i] = def.vertices[i] + this.m_position;
            this.m_ps[i].Copy(def.vertices[i]).Add(this.m_position);
            // this.m_p0s[i] = def.vertices[i] + this.m_position;
            this.m_p0s[i].Copy(def.vertices[i]).Add(this.m_position);
            this.m_vs[i].SetZero();

            const m: number = def.masses[i];
            if (m > 0.0) {
                this.m_invMasses[i] = 1.0 / m;
            } else {
                this.m_invMasses[i] = 0.0;
            }
        }

        this.m_stretchCount = this.m_count - 1;
        this.m_bendCount = this.m_count - 2;

        this.m_stretchConstraints = new Array(this.m_stretchCount);
        for(let i=0; i< this.m_stretchCount; i++) this.m_stretchConstraints[i] = new b2RopeStretch();
        this.m_bendConstraints = new Array(this.m_bendCount);
        for(let i=0; i< this.m_bendCount; i++) this.m_bendConstraints[i] = new b2RopeBend();

        for (let i = 0; i < this.m_stretchCount; ++i) {
            const c: b2RopeStretch = this.m_stretchConstraints[i];

            const p1: b2Vec2 = this.m_ps[i];
            const p2: b2Vec2 = this.m_ps[i + 1];

            c.i1 = i;
            c.i2 = i + 1;
            c.L = b2Vec2.Distance(p1, p2);
            c.invMass1 = this.m_invMasses[i];
            c.invMass2 = this.m_invMasses[i + 1];
            c.lambda = 0.0;
            c.damper = 0.0;
            c.spring = 0.0;
        }

        const { J1, J2, r, e1, e2, Jd1, Jd2 } = temp;
        for (let i = 0; i < this.m_bendCount; ++i) {
            const c: b2RopeBend = this.m_bendConstraints[i];

            const p1: b2Vec2 = this.m_ps[i];
            const p2: b2Vec2 = this.m_ps[i + 1];
            const p3: b2Vec2 = this.m_ps[i + 2];

            c.i1 = i;
            c.i2 = i + 1;
            c.i3 = i + 2;
            c.invMass1 = this.m_invMasses[i];
            c.invMass2 = this.m_invMasses[i + 1];
            c.invMass3 = this.m_invMasses[i + 2];
            c.invEffectiveMass = 0.0;
            c.L1 = b2Vec2.Distance(p1, p2);
            c.L2 = b2Vec2.Distance(p2, p3);
            c.lambda = 0.0;

            // Pre-compute effective mass (TODO use flattened config)
            b2Vec2.Subtract(p2, p1, e1);
            b2Vec2.Subtract(p3, p2, e2);
            const L1sqr: number = e1.LengthSquared();
            const L2sqr: number = e2.LengthSquared();

            if (L1sqr * L2sqr === 0.0) {
                continue;
            }

            Jd1.Copy(e1)
                .Skew()
                .Scale(-1.0 / L1sqr);
            Jd2.Copy(e2)
                .Skew()
                .Scale(1.0 / L2sqr);

            b2Vec2.Negate(Jd1, J1);
            b2Vec2.Subtract(Jd1, Jd2, J2);
            const J3 = Jd2;

            c.invEffectiveMass =
                c.invMass1 * b2Vec2.Dot(J1, J1) + c.invMass2 * b2Vec2.Dot(J2, J2) + c.invMass3 * b2Vec2.Dot(J3, J3);

            b2Vec2.Subtract(p3, p1, r);

            const rr: number = r.LengthSquared();
            if (rr === 0.0) {
                continue;
            }

            // a1 = h2 / (h1 + h2)
            // a2 = h1 / (h1 + h2)
            c.alpha1 = b2Vec2.Dot(e2, r) / rr;
            c.alpha2 = b2Vec2.Dot(e1, r) / rr;
        }

        this.m_gravity.Copy(def.gravity);

        this.SetTuning(def.tuning);
    }

    public SetTuning(tuning: b2RopeTuning): void {
        this.m_tuning.Copy(tuning);

        // Pre-compute spring and damper values based on tuning

        const bendOmega: number = 2.0 * Math.PI * this.m_tuning.bendHertz;

        for (let i = 0; i < this.m_bendCount; ++i) {
            const c: b2RopeBend = this.m_bendConstraints[i];

            const L1sqr: number = c.L1 * c.L1;
            const L2sqr: number = c.L2 * c.L2;

            if (L1sqr * L2sqr === 0.0) {
                c.spring = 0.0;
                c.damper = 0.0;
                continue;
            }

            // Flatten the triangle formed by the two edges
            const J2: number = 1.0 / c.L1 + 1.0 / c.L2;
            const sum: number = c.invMass1 / L1sqr + c.invMass2 * J2 * J2 + c.invMass3 / L2sqr;
            if (sum === 0.0) {
                c.spring = 0.0;
                c.damper = 0.0;
                continue;
            }

            const mass: number = 1.0 / sum;

            c.spring = mass * bendOmega * bendOmega;
            c.damper = 2.0 * mass * this.m_tuning.bendDamping * bendOmega;
        }

        const stretchOmega: number = 2.0 * Math.PI * this.m_tuning.stretchHertz;

        for (let i = 0; i < this.m_stretchCount; ++i) {
            const c: b2RopeStretch = this.m_stretchConstraints[i];

            const sum: number = c.invMass1 + c.invMass2;
            if (sum === 0.0) {
                continue;
            }

            const mass: number = 1.0 / sum;

            c.spring = mass * stretchOmega * stretchOmega;
            c.damper = 2.0 * mass * this.m_tuning.stretchDamping * stretchOmega;
        }
    }

    public Step(dt: number, iterations: number, position: Readonly<b2Vec2>): void {
        if (dt === 0.0) {
            return;
        }

        const inv_dt: number = 1.0 / dt;
        const d: number = Math.exp(-dt * this.m_tuning.damping);

        // Apply gravity and damping
        for (let i = 0; i < this.m_count; ++i) {
            if (this.m_invMasses[i] > 0.0) {
                // this.m_vs[i] *= d;
                this.m_vs[i].x *= d;
                this.m_vs[i].y *= d;
                // this.m_vs[i] += dt * this.m_gravity;
                this.m_vs[i].x += dt * this.m_gravity.x;
                this.m_vs[i].y += dt * this.m_gravity.y;
            } else {
                // this.m_vs[i] = inv_dt * (this.m_bindPositions[i] + position - this.m_p0s[i]);
                this.m_vs[i].x = inv_dt * (this.m_bindPositions[i].x + position.x - this.m_p0s[i].x);
                this.m_vs[i].y = inv_dt * (this.m_bindPositions[i].y + position.y - this.m_p0s[i].y);
            }
        }

        // Apply bending spring
        if (this.m_tuning.bendingModel === b2BendingModel.b2_springAngleBendingModel) {
            this.ApplyBendForces(dt);
        }

        for (let i = 0; i < this.m_bendCount; ++i) {
            this.m_bendConstraints[i].lambda = 0.0;
        }

        for (let i = 0; i < this.m_stretchCount; ++i) {
            this.m_stretchConstraints[i].lambda = 0.0;
        }

        // Update position
        for (let i = 0; i < this.m_count; ++i) {
            // this.m_ps[i] += dt * this.m_vs[i];
            this.m_ps[i].x += dt * this.m_vs[i].x;
            this.m_ps[i].y += dt * this.m_vs[i].y;
        }

        // Solve constraints
        for (let i = 0; i < iterations; ++i) {
            if (this.m_tuning.bendingModel === b2BendingModel.b2_pbdAngleBendingModel) {
                this.SolveBend_PBD_Angle();
            } else if (this.m_tuning.bendingModel === b2BendingModel.b2_xpbdAngleBendingModel) {
                this.SolveBend_XPBD_Angle(dt);
            } else if (this.m_tuning.bendingModel === b2BendingModel.b2_pbdDistanceBendingModel) {
                this.SolveBend_PBD_Distance();
            } else if (this.m_tuning.bendingModel === b2BendingModel.b2_pbdHeightBendingModel) {
                this.SolveBend_PBD_Height();
            }

            if (this.m_tuning.stretchingModel === b2StretchingModel.b2_pbdStretchingModel) {
                this.SolveStretch_PBD();
            } else if (this.m_tuning.stretchingModel === b2StretchingModel.b2_xpbdStretchingModel) {
                this.SolveStretch_XPBD(dt);
            }
        }

        // Constrain velocity
        for (let i = 0; i < this.m_count; ++i) {
            // this.m_vs[i] = inv_dt * (this.m_ps[i] - this.m_p0s[i]);
            this.m_vs[i].x = inv_dt * (this.m_ps[i].x - this.m_p0s[i].x);
            this.m_vs[i].y = inv_dt * (this.m_ps[i].y - this.m_p0s[i].y);
            this.m_p0s[i].Copy(this.m_ps[i]);
        }
    }

    public Reset(position: Readonly<b2Vec2>): void {
        this.m_position.Copy(position);

        for (let i = 0; i < this.m_count; ++i) {
            // this.m_ps[i] = this.m_bindPositions[i] + this.m_position;
            this.m_ps[i].x = this.m_bindPositions[i].x + this.m_position.x;
            this.m_ps[i].y = this.m_bindPositions[i].y + this.m_position.y;
            // this.m_p0s[i] = this.m_bindPositions[i] + this.m_position;
            this.m_p0s[i].x = this.m_bindPositions[i].x + this.m_position.x;
            this.m_p0s[i].y = this.m_bindPositions[i].y + this.m_position.y;
            this.m_vs[i].SetZero();
        }

        for (let i = 0; i < this.m_bendCount; ++i) {
            this.m_bendConstraints[i].lambda = 0.0;
        }

        for (let i = 0; i < this.m_stretchCount; ++i) {
            this.m_stretchConstraints[i].lambda = 0.0;
        }
    }

    private SolveStretch_PBD(): void {
        const stiffness: number = this.m_tuning.stretchStiffness;

        const { p1, p2, d } = temp;
        for (let i = 0; i < this.m_stretchCount; ++i) {
            const c: b2RopeStretch = this.m_stretchConstraints[i];

            p1.Copy(this.m_ps[c.i1]);
            p2.Copy(this.m_ps[c.i2]);

            b2Vec2.Subtract(p2, p1, d);
            const L: number = d.Normalize();

            const sum: number = c.invMass1 + c.invMass2;
            if (sum === 0.0) {
                continue;
            }

            const s1: number = c.invMass1 / sum;
            const s2: number = c.invMass2 / sum;

            // p1 -= stiffness * s1 * (c.L - L) * d;
            p1.x -= stiffness * s1 * (c.L - L) * d.x;
            p1.y -= stiffness * s1 * (c.L - L) * d.y;
            // p2 += stiffness * s2 * (c.L - L) * d;
            p2.x += stiffness * s2 * (c.L - L) * d.x;
            p2.y += stiffness * s2 * (c.L - L) * d.y;

            this.m_ps[c.i1].Copy(p1);
            this.m_ps[c.i2].Copy(p2);
        }
    }

    private SolveStretch_XPBD(dt: number): void {
        // 	b2Assert(dt > 0.0);

        const { p1, p2, dp1, dp2, u, J1 } = temp;
        for (let i = 0; i < this.m_stretchCount; ++i) {
            const c: b2RopeStretch = this.m_stretchConstraints[i];

            p1.Copy(this.m_ps[c.i1]);
            p2.Copy(this.m_ps[c.i2]);

            b2Vec2.Subtract(p1, this.m_p0s[c.i1], dp1);
            b2Vec2.Subtract(p2, this.m_p0s[c.i2], dp2);

            // b2Vec2 u = p2 - p1;
            b2Vec2.Subtract(p2, p1, u);
            const L: number = u.Normalize();

            b2Vec2.Negate(u, J1);
            const J2: b2Vec2 = u;

            const sum: number = c.invMass1 + c.invMass2;
            if (sum === 0.0) {
                continue;
            }

            const alpha: number = 1.0 / (c.spring * dt * dt); // 1 / kg
            const beta: number = dt * dt * c.damper; // kg * s
            const sigma: number = (alpha * beta) / dt; // non-dimensional
            const C: number = L - c.L;

            // This is using the initial velocities
            const Cdot: number = b2Vec2.Dot(J1, dp1) + b2Vec2.Dot(J2, dp2);

            const B: number = C + alpha * c.lambda + sigma * Cdot;
            const sum2: number = (1.0 + sigma) * sum + alpha;

            const impulse: number = -B / sum2;

            // p1 += (c.invMass1 * impulse) * J1;
            p1.x += c.invMass1 * impulse * J1.x;
            p1.y += c.invMass1 * impulse * J1.y;
            // p2 += (c.invMass2 * impulse) * J2;
            p2.x += c.invMass2 * impulse * J2.x;
            p2.y += c.invMass2 * impulse * J2.y;

            this.m_ps[c.i1].Copy(p1);
            this.m_ps[c.i2].Copy(p2);
            c.lambda += impulse;
        }
    }

    private SolveBend_PBD_Angle(): void {
        const stiffness: number = this.m_tuning.bendStiffness;

        const { Jd1, Jd2, J1, J2, d1, d2 } = temp;
        for (let i = 0; i < this.m_bendCount; ++i) {
            const c: b2RopeBend = this.m_bendConstraints[i];

            const p1: b2Vec2 = this.m_ps[c.i1];
            const p2: b2Vec2 = this.m_ps[c.i2];
            const p3: b2Vec2 = this.m_ps[c.i3];

            b2Vec2.Subtract(p2, p1, d1);
            // b2Vec2 d2 = p3 - p2;
            b2Vec2.Subtract(p3, p2, d2);
            const a: number = b2Vec2.Cross(d1, d2);
            const b: number = b2Vec2.Dot(d1, d2);

            const angle: number = Math.atan2(a, b);

            let L1sqr = 0.0;
            let L2sqr = 0.0;

            if (this.m_tuning.isometric) {
                L1sqr = c.L1 * c.L1;
                L2sqr = c.L2 * c.L2;
            } else {
                L1sqr = d1.LengthSquared();
                L2sqr = d2.LengthSquared();
            }

            if (L1sqr * L2sqr === 0.0) {
                continue;
            }

            // b2Vec2 Jd1 = (-1.0 / L1sqr) * d1.Skew();
            Jd1.Copy(d1)
                .Skew()
                .Scale(-1.0 / L1sqr);
            // b2Vec2 Jd2 = (1.0 / L2sqr) * d2.Skew();
            Jd2.Copy(d2)
                .Skew()
                .Scale(1.0 / L2sqr);

            b2Vec2.Negate(Jd1, J1);
            b2Vec2.Subtract(Jd1, Jd2, J2);
            const J3 = Jd2;

            let sum = 0.0;
            if (this.m_tuning.fixedEffectiveMass) {
                sum = c.invEffectiveMass;
            } else {
                sum =
                    c.invMass1 * b2Vec2.Dot(J1, J1) + c.invMass2 * b2Vec2.Dot(J2, J2) + c.invMass3 * b2Vec2.Dot(J3, J3);
            }

            if (sum === 0.0) {
                sum = c.invEffectiveMass;
            }

            const impulse: number = (-stiffness * angle) / sum;

            // p1 += (c.invMass1 * impulse) * J1;
            p1.x += c.invMass1 * impulse * J1.x;
            p1.y += c.invMass1 * impulse * J1.y;
            // p2 += (c.invMass2 * impulse) * J2;
            p2.x += c.invMass2 * impulse * J2.x;
            p2.y += c.invMass2 * impulse * J2.y;
            // p3 += (c.invMass3 * impulse) * J3;
            p3.x += c.invMass3 * impulse * J3.x;
            p3.y += c.invMass3 * impulse * J3.y;

            this.m_ps[c.i1].Copy(p1);
            this.m_ps[c.i2].Copy(p2);
            this.m_ps[c.i3].Copy(p3);
        }
    }

    private SolveBend_XPBD_Angle(dt: number): void {
        // b2Assert(dt > 0.0);

        const { dp1, dp2, dp3, d1, d2, Jd1, Jd2, J1, J2 } = temp;
        for (let i = 0; i < this.m_bendCount; ++i) {
            const c: b2RopeBend = this.m_bendConstraints[i];

            const p1: b2Vec2 = this.m_ps[c.i1];
            const p2: b2Vec2 = this.m_ps[c.i2];
            const p3: b2Vec2 = this.m_ps[c.i3];

            b2Vec2.Subtract(p1, this.m_p0s[c.i1], dp1);
            b2Vec2.Subtract(p2, this.m_p0s[c.i2], dp2);
            b2Vec2.Subtract(p3, this.m_p0s[c.i3], dp3);

            b2Vec2.Subtract(p2, p1, d1);
            b2Vec2.Subtract(p3, p2, d2);

            let L1sqr: number;
            let L2sqr: number;

            if (this.m_tuning.isometric) {
                L1sqr = c.L1 * c.L1;
                L2sqr = c.L2 * c.L2;
            } else {
                L1sqr = d1.LengthSquared();
                L2sqr = d2.LengthSquared();
            }

            if (L1sqr * L2sqr === 0.0) {
                continue;
            }

            const a: number = b2Vec2.Cross(d1, d2);
            const b: number = b2Vec2.Dot(d1, d2);

            const angle: number = Math.atan2(a, b);

            // b2Vec2 Jd1 = (-1.0 / L1sqr) * d1.Skew();
            // b2Vec2 Jd2 = (1.0 / L2sqr) * d2.Skew();

            // b2Vec2 J1 = -Jd1;
            // b2Vec2 J2 = Jd1 - Jd2;
            // b2Vec2 J3 = Jd2;

            // b2Vec2 Jd1 = (-1.0 / L1sqr) * d1.Skew();
            Jd1.Copy(d1)
                .Skew()
                .Scale(-1.0 / L1sqr);
            // b2Vec2 Jd2 = (1.0 / L2sqr) * d2.Skew();
            Jd2.Copy(d2)
                .Skew()
                .Scale(1.0 / L2sqr);

            b2Vec2.Negate(Jd1, J1);
            b2Vec2.Subtract(Jd1, Jd2, J2);
            const J3 = Jd2;

            let sum: number;
            if (this.m_tuning.fixedEffectiveMass) {
                sum = c.invEffectiveMass;
            } else {
                sum =
                    c.invMass1 * b2Vec2.Dot(J1, J1) + c.invMass2 * b2Vec2.Dot(J2, J2) + c.invMass3 * b2Vec2.Dot(J3, J3);
            }

            if (sum === 0.0) {
                continue;
            }

            const alpha: number = 1.0 / (c.spring * dt * dt);
            const beta: number = dt * dt * c.damper;
            const sigma: number = (alpha * beta) / dt;
            const C: number = angle;

            // This is using the initial velocities
            const Cdot: number = b2Vec2.Dot(J1, dp1) + b2Vec2.Dot(J2, dp2) + b2Vec2.Dot(J3, dp3);

            const B: number = C + alpha * c.lambda + sigma * Cdot;
            const sum2: number = (1.0 + sigma) * sum + alpha;

            const impulse: number = -B / sum2;

            // p1 += (c.invMass1 * impulse) * J1;
            p1.x += c.invMass1 * impulse * J1.x;
            p1.y += c.invMass1 * impulse * J1.y;
            // p2 += (c.invMass2 * impulse) * J2;
            p2.x += c.invMass2 * impulse * J2.x;
            p2.y += c.invMass2 * impulse * J2.y;
            // p3 += (c.invMass3 * impulse) * J3;
            p3.x += c.invMass3 * impulse * J3.x;
            p3.y += c.invMass3 * impulse * J3.y;

            this.m_ps[c.i1].Copy(p1);
            this.m_ps[c.i2].Copy(p2);
            this.m_ps[c.i3].Copy(p3);
            c.lambda += impulse;
        }
    }

    private SolveBend_PBD_Distance(): void {
        const stiffness: number = this.m_tuning.bendStiffness;

        const { p1, p2, d } = temp;
        for (let i = 0; i < this.m_bendCount; ++i) {
            const c: b2RopeBend = this.m_bendConstraints[i];

            const { i1 } = c;
            const i2: number = c.i3;

            p1.Copy(this.m_ps[i1]);
            p2.Copy(this.m_ps[i2]);

            b2Vec2.Subtract(p2, p1, d);
            const L: number = d.Normalize();

            const sum: number = c.invMass1 + c.invMass3;
            if (sum === 0.0) {
                continue;
            }

            const s1: number = c.invMass1 / sum;
            const s2: number = c.invMass3 / sum;

            // p1 -= stiffness * s1 * (c.L1 + c.L2 - L) * d;
            p1.x -= stiffness * s1 * (c.L1 + c.L2 - L) * d.x;
            p1.y -= stiffness * s1 * (c.L1 + c.L2 - L) * d.y;
            // p2 += stiffness * s2 * (c.L1 + c.L2 - L) * d;
            p2.x += stiffness * s2 * (c.L1 + c.L2 - L) * d.x;
            p2.y += stiffness * s2 * (c.L1 + c.L2 - L) * d.y;

            this.m_ps[i1].Copy(p1);
            this.m_ps[i2].Copy(p2);
        }
    }

    private SolveBend_PBD_Height(): void {
        const stiffness: number = this.m_tuning.bendStiffness;

        const { dHat, J1, J2, J3, d } = temp;
        for (let i = 0; i < this.m_bendCount; ++i) {
            const c: b2RopeBend = this.m_bendConstraints[i];

            const p1 = this.m_ps[c.i1];
            const p2 = this.m_ps[c.i2];
            const p3 = this.m_ps[c.i3];

            // Barycentric coordinates are held constant
            d.x = c.alpha1 * p1.x + c.alpha2 * p3.x - p2.x;
            d.y = c.alpha1 * p1.y + c.alpha2 * p3.y - p2.y;
            const dLen: number = d.Length();

            if (dLen === 0.0) {
                continue;
            }

            b2Vec2.Scale(1.0 / dLen, d, dHat);

            b2Vec2.Scale(c.alpha1, dHat, J1);
            b2Vec2.Negate(dHat, J2);
            b2Vec2.Scale(c.alpha2, dHat, J3);

            const sum: number = c.invMass1 * c.alpha1 * c.alpha1 + c.invMass2 + c.invMass3 * c.alpha2 * c.alpha2;

            if (sum === 0.0) {
                continue;
            }

            const C: number = dLen;
            const mass: number = 1.0 / sum;
            const impulse: number = -stiffness * mass * C;

            // p1 += (c.invMass1 * impulse) * J1;
            p1.x += c.invMass1 * impulse * J1.x;
            p1.y += c.invMass1 * impulse * J1.y;
            // p2 += (c.invMass2 * impulse) * J2;
            p2.x += c.invMass2 * impulse * J2.x;
            p2.y += c.invMass2 * impulse * J2.y;
            // p3 += (c.invMass3 * impulse) * J3;
            p3.x += c.invMass3 * impulse * J3.x;
            p3.y += c.invMass3 * impulse * J3.y;
        }
    }

    private ApplyBendForces(dt: number): void {
        // omega = 2 * pi * hz
        const omega: number = 2.0 * Math.PI * this.m_tuning.bendHertz;

        const { d1, d2, Jd1, Jd2, J1, J2 } = temp;
        for (let i = 0; i < this.m_bendCount; ++i) {
            const c: b2RopeBend = this.m_bendConstraints[i];

            const p1 = this.m_ps[c.i1];
            const p2 = this.m_ps[c.i2];
            const p3 = this.m_ps[c.i3];

            const v1 = this.m_vs[c.i1];
            const v2 = this.m_vs[c.i2];
            const v3 = this.m_vs[c.i3];

            b2Vec2.Subtract(p2, p1, d1);
            b2Vec2.Subtract(p3, p2, d2);

            let L1sqr: number;
            let L2sqr: number;

            if (this.m_tuning.isometric) {
                L1sqr = c.L1 * c.L1;
                L2sqr = c.L2 * c.L2;
            } else {
                L1sqr = d1.LengthSquared();
                L2sqr = d2.LengthSquared();
            }

            if (L1sqr * L2sqr === 0.0) {
                continue;
            }

            const a: number = b2Vec2.Cross(d1, d2);
            const b: number = b2Vec2.Dot(d1, d2);

            const angle: number = Math.atan2(a, b);

            // b2Vec2 Jd1 = (-1.0 / L1sqr) * d1.Skew();
            // b2Vec2 Jd2 = (1.0 / L2sqr) * d2.Skew();

            // b2Vec2 J1 = -Jd1;
            // b2Vec2 J2 = Jd1 - Jd2;
            // b2Vec2 J3 = Jd2;

            Jd1.Copy(d1)
                .Skew()
                .Scale(-1.0 / L1sqr);
            Jd2.Copy(d2)
                .Skew()
                .Scale(1.0 / L2sqr);

            b2Vec2.Negate(Jd1, J1);
            b2Vec2.Subtract(Jd1, Jd2, J2);
            const J3 = Jd2;

            let sum = 0.0;
            if (this.m_tuning.fixedEffectiveMass) {
                sum = c.invEffectiveMass;
            } else {
                sum =
                    c.invMass1 * b2Vec2.Dot(J1, J1) + c.invMass2 * b2Vec2.Dot(J2, J2) + c.invMass3 * b2Vec2.Dot(J3, J3);
            }

            if (sum === 0.0) {
                continue;
            }

            const mass: number = 1.0 / sum;

            const spring: number = mass * omega * omega;
            const damper: number = 2.0 * mass * this.m_tuning.bendDamping * omega;

            const C: number = angle;
            const Cdot: number = b2Vec2.Dot(J1, v1) + b2Vec2.Dot(J2, v2) + b2Vec2.Dot(J3, v3);

            const impulse: number = -dt * (spring * C + damper * Cdot);

            // this.m_vs[c.i1] += (c.invMass1 * impulse) * J1;
            this.m_vs[c.i1].x += c.invMass1 * impulse * J1.x;
            this.m_vs[c.i1].y += c.invMass1 * impulse * J1.y;
            // this.m_vs[c.i2] += (c.invMass2 * impulse) * J2;
            this.m_vs[c.i2].x += c.invMass2 * impulse * J2.x;
            this.m_vs[c.i2].y += c.invMass2 * impulse * J2.y;
            // this.m_vs[c.i3] += (c.invMass3 * impulse) * J3;
            this.m_vs[c.i3].x += c.invMass3 * impulse * J3.x;
            this.m_vs[c.i3].y += c.invMass3 * impulse * J3.y;
        }
    }
}
