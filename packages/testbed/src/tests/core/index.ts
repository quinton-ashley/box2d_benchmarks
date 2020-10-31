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
import { AddPair } from "./add_pair";
import { ApplyForce } from "./apply_force";
import { BasicSliderCrank } from "./basic_slider_crank";
import { BodyTypes } from "./body_types";
import { Breakable } from "./breakable";
import { Bridge } from "./bridge";
import { BulletTest } from "./bullet_test";
import { Cantilever } from "./cantilever";
import { Car } from "./car";
import { ContinuousTest } from "./continuous_test";
import { Chain } from "./chain";
import { CharacterCollision } from "./character_collision";
import { CollisionFiltering } from "./collision_filtering";
import { CollisionProcessing } from "./collision_processing";
import { CompoundShapes } from "./compound_shapes";
import { Confined } from "./confined";
import { ConvexHull } from "./convex_hull";
import { ConveyorBelt } from "./conveyor_belt";
import { DistanceTest } from "./distance_test";
import { Dominos } from "./dominos";
import { DumpShell } from "./dump_shell";
import { DynamicTreeTest } from "./dynamic_tree_test";
import { EdgeShapes } from "./edge_shapes";
import { EdgeTest } from "./edge_test";
import { Gears } from "./gears";
import { HeavyOnLight } from "./heavy1";
import { HeavyOnLightTwo } from "./heavy2";
import { Mobile } from "./mobile_unbalanced";
import { MobileBalanced } from "./mobile_balanced";
import { MotorJoint } from "./motor_joint";
import { OneSidedPlatform } from "./one_sided_platform";
import { Pinball } from "./pinball";
import { PolyCollision } from "./poly_collision";
import { PolyShapes } from "./poly_shapes";
import { Prismatic } from "./prismatic";
import { Pulleys } from "./pulleys";
import { Pyramid } from "./pyramid";
import { RayCast } from "./ray_cast";
import { Revolute } from "./revolute";
import { SensorTest } from "./sensor_test";
import { ShapeCast } from "./shape_cast";
import { ShapeEditing } from "./shape_editing";
import { Skier } from "./skier";
import { SliderCrank } from "./slider_crank";
import { SphereStack } from "./sphere_stack";
import { TheoJansen } from "./theo_jansen";
import { Tiles } from "./tiles";
import { TimeOfImpact } from "./time_of_impact";
import { Tumbler } from "./tumbler";
import { VaryingFriction } from "./varying_friction";
import { VaryingRestitution } from "./varying_restitution";
import { VerticalStack } from "./vertical_stack";
import { Web } from "./web";
import { Rope } from "./rope";
import { MotorJoint2 } from "./motor_joint2";
import { BlobTest } from "./blob_test";
import { TestCCD } from "./test_ccd";
import { TestRagdoll } from "./test_ragdoll";
import { TestStack } from "./test_stack";
import { PyramidTopple } from "./pyramid_topple";
import { DominoTower } from "./domino_tower";
import { TopdownCar } from "./top_down_car";

export const coreTests: TestEntry[] = [
    ["Add Pair Stress Test", AddPair],
    ["Apply Force", ApplyForce],
    ["Basic Slider Crank", BasicSliderCrank],
    ["Blob Test", BlobTest],
    ["Body Types", BodyTypes],
    ["Breakable", Breakable],
    ["Bridge", Bridge],
    ["Bullet Test", BulletTest],
    ["Cantilever", Cantilever],
    ["Car", Car],
    ["Chain", Chain],
    ["Character Collision", CharacterCollision],
    ["Collision Filtering", CollisionFiltering],
    ["Collision Processing", CollisionProcessing],
    ["Compound Shapes", CompoundShapes],
    ["Confined", Confined],
    ["Continuous Collision", TestCCD],
    ["Continuous Test", ContinuousTest],
    ["Convex Hull", ConvexHull],
    ["Conveyor Belt", ConveyorBelt],
    ["Distance Test", DistanceTest],
    ["Domino Tower", DominoTower],
    ["Dominos", Dominos],
    ["Dump Shell", DumpShell],
    ["Dynamic Tree", DynamicTreeTest],
    ["Edge Shapes", EdgeShapes],
    ["Edge Test", EdgeTest],
    ["Gears", Gears],
    ["Heavy on Light Two", HeavyOnLightTwo],
    ["Heavy on Light", HeavyOnLight],
    ["Mobile", Mobile],
    ["MobileBalanced", MobileBalanced],
    ["Motor Joint (Bug #487)", MotorJoint2],
    ["Motor Joint", MotorJoint],
    ["One-Sided Platform", OneSidedPlatform],
    ["Pinball", Pinball],
    ["PolyCollision", PolyCollision],
    ["Polygon Shapes", PolyShapes],
    ["Prismatic", Prismatic],
    ["Pulleys", Pulleys],
    ["Pyramid Topple", PyramidTopple],
    ["Pyramid", Pyramid],
    ["Ragdolls", TestRagdoll],
    ["Ray-Cast", RayCast],
    ["Revolute", Revolute],
    ["Rope", Rope],
    ["Sensor Test", SensorTest],
    ["Shape Cast", ShapeCast],
    ["Shape Editing", ShapeEditing],
    ["Skier", Skier],
    ["Slider Crank", SliderCrank],
    ["Sphere Stack", SphereStack],
    ["Stacked Boxes", TestStack],
    ["Theo Jansen's Walker", TheoJansen],
    ["Tiles", Tiles],
    ["Time of Impact", TimeOfImpact],
    ["TopDown Car", TopdownCar],
    ["Tumbler", Tumbler],
    ["Varying Friction", VaryingFriction],
    ["Varying Restitution", VaryingRestitution],
    ["Vertical Stack", VerticalStack],
    ["Web", Web],
];
