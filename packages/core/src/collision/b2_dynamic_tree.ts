/*
 * Copyright (c) 2009 Erin Catto http://www.box2d.org
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
import { b2Assert, b2Verify, b2_aabbExtension, b2_aabbMultiplier } from "../common/b2_common";
import { b2Vec2, XY } from "../common/b2_math";
import { b2AABB, b2RayCastInput } from "./b2_collision";

const temp = {
    stack: [] as Array<b2TreeNode<any> | null>,
    t: new b2Vec2(),
    r: new b2Vec2(),
    v: new b2Vec2(),
    abs_v: new b2Vec2(),
    segmentAABB: new b2AABB(),
    subInput: new b2RayCastInput(),
    combinedAABB: new b2AABB(),
    aabb: new b2AABB(),
    fatAABB: new b2AABB(),
    hugeAABB: new b2AABB(),
};

let nextNodeid = 0;

/// A node in the dynamic tree. The client does not interact with this directly.
export class b2TreeNode<T> {
    public readonly m_id: number = 0;

    public readonly aabb: b2AABB = new b2AABB();

    public userData: T | null = null;

    public parent: b2TreeNode<T> | null = null; // or next

    public child1: b2TreeNode<T> | null = null;

    public child2: b2TreeNode<T> | null = null;

    public height = 0; // leaf = 0, free node = -1

    public moved = false;

    constructor() {
        this.m_id = nextNodeid++;
    }

    public Reset(): void {
        this.child1 = null;
        this.child2 = null;
        this.height = -1;
        this.userData = null;
    }

    public IsLeaf(): boolean {
        return this.child1 === null;
    }

    public GetArea(): number {
        if (this.IsLeaf()) return 0;

        let area: number = this.aabb.GetPerimeter();
        if (this.child1) area += this.child1.GetArea();
        if (this.child2) area += this.child2.GetArea();
        return area;
    }

    public ComputeHeight(): number {
        if (this.IsLeaf()) return 0;

        b2Assert(this.child1 !== null && this.child2 !== null);

        const height1 = b2Verify(this.child1).ComputeHeight();
        const height2 = b2Verify(this.child2).ComputeHeight();
        return 1 + Math.max(height1, height2);
    }

    public GetMaxBalance(): number {
        if (this.height <= 1) return 0;

        const child1 = b2Verify(this.child1);
        const child2 = b2Verify(this.child2);
        return Math.max(child1.GetMaxBalance(), child2.GetMaxBalance(), Math.abs(child2.height - child1.height));
    }

    public ShiftOrigin(newOrigin: XY): void {
        if (this.height <= 1) return;

        b2Verify(this.child1).ShiftOrigin(newOrigin);
        b2Verify(this.child2).ShiftOrigin(newOrigin);

        this.aabb.lowerBound.SelfSub(newOrigin);
        this.aabb.upperBound.SelfSub(newOrigin);
    }
}

/// A dynamic AABB tree broad-phase, inspired by Nathanael Presson's btDbvt.
/// A dynamic tree arranges data in a binary tree to accelerate
/// queries such as volume queries and ray casts. Leafs are proxies
/// with an AABB. In the tree we expand the proxy AABB by b2_fatAABBFactor
/// so that the proxy AABB is bigger than the client object. This allows the client
/// object to move by small amounts without triggering a tree update.
///
/// Nodes are pooled
export class b2DynamicTree<T> {
    public m_root: b2TreeNode<T> | null = null;

    public m_freeList: b2TreeNode<T> | null = null;

    public m_path = 0;

    public m_insertionCount = 0;

    public Query(aabb: b2AABB, callback: (node: b2TreeNode<T>) => boolean): void {
        const stack = temp.stack as Array<b2TreeNode<T> | null>;
        stack.length = 0;

        let node: b2TreeNode<T> | null | undefined = this.m_root;
        while (node) {
            if (node.aabb.TestOverlap(aabb)) {
                if (node.IsLeaf()) {
                    const proceed = callback(node);
                    if (!proceed) {
                        return;
                    }
                } else {
                    stack.push(node.child1);
                    stack.push(node.child2);
                }
            }
            node = stack.pop();
        }
    }

    public QueryPoint(point: XY, callback: (node: b2TreeNode<T>) => boolean): void {
        const stack = temp.stack as Array<b2TreeNode<T> | null>;
        stack.length = 0;

        let node: b2TreeNode<T> | null | undefined = this.m_root;
        while (node) {
            if (node.aabb.TestContain(point)) {
                if (node.IsLeaf()) {
                    const proceed = callback(node);
                    if (!proceed) {
                        return;
                    }
                } else {
                    stack.push(node.child1);
                    stack.push(node.child2);
                }
            }
            node = stack.pop();
        }
    }

    public RayCast(input: b2RayCastInput, callback: (input: b2RayCastInput, node: b2TreeNode<T>) => number): void {
        const { p1, p2 } = input;
        const r = b2Vec2.SubVV(p2, p1, temp.r);
        // DEBUG: b2Assert(r.LengthSquared() > 0);
        r.Normalize();

        // v is perpendicular to the segment.
        const v = b2Vec2.CrossOneV(r, temp.v);
        const abs_v = b2Vec2.AbsV(v, temp.abs_v);

        // Separating axis for segment (Gino, p80).
        // |dot(v, p1 - c)| > dot(|v|, h)

        let { maxFraction } = input;

        // Build a bounding box for the segment.
        const { segmentAABB, subInput } = temp;
        const t = temp.t.Set(p1.x + maxFraction * (p2.x - p1.x), p1.y + maxFraction * (p2.y - p1.y));
        b2Vec2.MinV(p1, t, segmentAABB.lowerBound);
        b2Vec2.MaxV(p1, t, segmentAABB.upperBound);

        const stack = temp.stack as Array<b2TreeNode<T> | null>;
        stack.length = 0;

        let node: b2TreeNode<T> | null | undefined = this.m_root;
        while (node) {
            if (!node.aabb.TestOverlap(segmentAABB)) {
                node = stack.pop();
                continue;
            }

            // Separating axis for segment (Gino, p80).
            // |dot(v, p1 - c)| > dot(|v|, h)
            const c = node.aabb.GetCenter();
            const h = node.aabb.GetExtents();
            const separation = Math.abs(b2Vec2.DotVV(v, b2Vec2.SubVV(p1, c, b2Vec2.s_t0))) - b2Vec2.DotVV(abs_v, h);
            if (separation > 0) {
                node = stack.pop();
                continue;
            }

            if (node.IsLeaf()) {
                subInput.p1.Copy(input.p1);
                subInput.p2.Copy(input.p2);
                subInput.maxFraction = maxFraction;

                const value = callback(subInput, node);

                if (value === 0) {
                    // The client has terminated the ray cast.
                    return;
                }

                if (value > 0) {
                    // Update segment bounding box.
                    maxFraction = value;
                    t.Set(p1.x + maxFraction * (p2.x - p1.x), p1.y + maxFraction * (p2.y - p1.y));
                    b2Vec2.MinV(p1, t, segmentAABB.lowerBound);
                    b2Vec2.MaxV(p1, t, segmentAABB.upperBound);
                }
            } else {
                stack.push(node.child1);
                stack.push(node.child2);
            }
            node = stack.pop();
        }
    }

    public AllocateNode(): b2TreeNode<T> {
        // Expand the node pool as needed.
        if (this.m_freeList === null) {
            return new b2TreeNode<T>();
        }

        const node = this.m_freeList;
        this.m_freeList = node.parent;
        node.parent = null;
        node.child1 = null;
        node.child2 = null;
        node.height = 0;
        node.moved = false;
        return node;
    }

    public FreeNode(node: b2TreeNode<T>): void {
        node.parent = this.m_freeList;
        node.Reset();
        this.m_freeList = node;
    }

    public CreateProxy(aabb: b2AABB, userData: T): b2TreeNode<T> {
        const node = this.AllocateNode();

        // Fatten the aabb.
        node.aabb.lowerBound.Set(aabb.lowerBound.x - b2_aabbExtension, aabb.lowerBound.y - b2_aabbExtension);
        node.aabb.upperBound.Set(aabb.upperBound.x + b2_aabbExtension, aabb.upperBound.y + b2_aabbExtension);
        node.userData = userData;
        node.height = 0;
        node.moved = true;

        this.InsertLeaf(node);

        return node;
    }

    public DestroyProxy(node: b2TreeNode<T>): void {
        // DEBUG: b2Assert(node.IsLeaf());

        this.RemoveLeaf(node);
        this.FreeNode(node);
    }

    public MoveProxy(node: b2TreeNode<T>, aabb: b2AABB, displacement: b2Vec2): boolean {
        // DEBUG: b2Assert(node.IsLeaf());

        // Extend AABB
        const { fatAABB, hugeAABB } = temp;
        fatAABB.lowerBound.Set(aabb.lowerBound.x - b2_aabbExtension, aabb.lowerBound.y - b2_aabbExtension);
        fatAABB.upperBound.Set(aabb.upperBound.x + b2_aabbExtension, aabb.upperBound.y + b2_aabbExtension);

        // Predict AABB movement
        const d_x: number = b2_aabbMultiplier * displacement.x;
        const d_y: number = b2_aabbMultiplier * displacement.y;

        if (d_x < 0.0) {
            fatAABB.lowerBound.x += d_x;
        } else {
            fatAABB.upperBound.x += d_x;
        }

        if (d_y < 0.0) {
            fatAABB.lowerBound.y += d_y;
        } else {
            fatAABB.upperBound.y += d_y;
        }

        const treeAABB = node.aabb;
        if (treeAABB.Contains(aabb)) {
            // The tree AABB still contains the object, but it might be too large.
            // Perhaps the object was moving fast but has since gone to sleep.
            // The huge AABB is larger than the new fat AABB.
            const r4 = 4 * b2_aabbExtension;
            hugeAABB.lowerBound.Set(fatAABB.lowerBound.x - r4, aabb.lowerBound.y - r4);
            hugeAABB.upperBound.Set(fatAABB.upperBound.x + r4, aabb.upperBound.y + r4);

            if (hugeAABB.Contains(treeAABB)) {
                // The tree AABB contains the object AABB and the tree AABB is
                // not too large. No tree update needed.
                return false;
            }

            // Otherwise the tree AABB is huge and needs to be shrunk
        }

        this.RemoveLeaf(node);

        node.aabb.Copy(fatAABB);

        this.InsertLeaf(node);

        node.moved = true;

        return true;
    }

    public InsertLeaf(leaf: b2TreeNode<T>): void {
        ++this.m_insertionCount;

        if (this.m_root === null) {
            this.m_root = leaf;
            this.m_root.parent = null;
            return;
        }

        // Find the best sibling for this node
        const { combinedAABB, aabb } = temp;
        const leafAABB = leaf.aabb;
        let sibling = this.m_root;
        while (!sibling.IsLeaf()) {
            const child1 = b2Verify(sibling.child1);
            const child2 = b2Verify(sibling.child2);

            const area = sibling.aabb.GetPerimeter();

            combinedAABB.Combine2(sibling.aabb, leafAABB);
            const combinedArea = combinedAABB.GetPerimeter();

            // Cost of creating a new parent for this node and the new leaf
            const cost = 2 * combinedArea;

            // Minimum cost of pushing the leaf further down the tree
            const inheritanceCost = 2 * (combinedArea - area);

            // Cost of descending into child1
            let cost1: number;
            let oldArea: number;
            let newArea: number;
            if (child1.IsLeaf()) {
                aabb.Combine2(leafAABB, child1.aabb);
                cost1 = aabb.GetPerimeter() + inheritanceCost;
            } else {
                aabb.Combine2(leafAABB, child1.aabb);
                oldArea = child1.aabb.GetPerimeter();
                newArea = aabb.GetPerimeter();
                cost1 = newArea - oldArea + inheritanceCost;
            }

            // Cost of descending into child2
            let cost2: number;
            if (child2.IsLeaf()) {
                aabb.Combine2(leafAABB, child2.aabb);
                cost2 = aabb.GetPerimeter() + inheritanceCost;
            } else {
                aabb.Combine2(leafAABB, child2.aabb);
                oldArea = child2.aabb.GetPerimeter();
                newArea = aabb.GetPerimeter();
                cost2 = newArea - oldArea + inheritanceCost;
            }

            // Descend according to the minimum cost.
            if (cost < cost1 && cost < cost2) {
                break;
            }

            // Descend
            if (cost1 < cost2) {
                sibling = child1;
            } else {
                sibling = child2;
            }
        }

        // Create a new parent.
        const oldParent = sibling.parent;
        const newParent = this.AllocateNode();
        newParent.parent = oldParent;
        newParent.userData = null;
        newParent.aabb.Combine2(leafAABB, sibling.aabb);
        newParent.height = sibling.height + 1;

        if (oldParent !== null) {
            // The sibling was not the root.
            if (oldParent.child1 === sibling) {
                oldParent.child1 = newParent;
            } else {
                oldParent.child2 = newParent;
            }

            newParent.child1 = sibling;
            newParent.child2 = leaf;
            sibling.parent = newParent;
            leaf.parent = newParent;
        } else {
            // The sibling was the root.
            newParent.child1 = sibling;
            newParent.child2 = leaf;
            sibling.parent = newParent;
            leaf.parent = newParent;
            this.m_root = newParent;
        }

        // Walk back up the tree fixing heights and AABBs
        let node: b2TreeNode<T> | null = leaf.parent;
        while (node !== null) {
            node = this.Balance(node);

            const child1 = b2Verify(node.child1);
            const child2 = b2Verify(node.child2);

            node.height = 1 + Math.max(child1.height, child2.height);
            node.aabb.Combine2(child1.aabb, child2.aabb);

            node = node.parent;
        }

        // this.Validate();
    }

    public RemoveLeaf(leaf: b2TreeNode<T>): void {
        if (leaf === this.m_root) {
            this.m_root = null;
            return;
        }

        const parent = b2Verify(leaf.parent);
        const grandParent = parent?.parent;
        const sibling = b2Verify(parent.child1 === leaf ? parent.child2 : parent.child1);

        if (grandParent !== null) {
            // Destroy parent and connect sibling to grandParent.
            if (grandParent.child1 === parent) {
                grandParent.child1 = sibling;
            } else {
                grandParent.child2 = sibling;
            }
            sibling.parent = grandParent;
            this.FreeNode(parent);

            // Adjust ancestor bounds.
            let index: b2TreeNode<T> | null = grandParent;
            while (index !== null) {
                index = this.Balance(index);

                const child1 = b2Verify(index.child1);
                const child2 = b2Verify(index.child2);

                index.aabb.Combine2(child1.aabb, child2.aabb);
                index.height = 1 + Math.max(child1.height, child2.height);

                index = index.parent;
            }
        } else {
            this.m_root = sibling;
            sibling.parent = null;
            this.FreeNode(parent);
        }

        // this.Validate();
    }

    public Balance(A: b2TreeNode<T>): b2TreeNode<T> {
        // DEBUG: b2Assert(A !== null);

        if (A.IsLeaf() || A.height < 2) {
            return A;
        }

        const B = b2Verify(A.child1);
        const C = b2Verify(A.child2);

        const balance: number = C.height - B.height;

        // Rotate C up
        if (balance > 1) {
            const F = b2Verify(C.child1);
            const G = b2Verify(C.child2);

            // Swap A and C
            C.child1 = A;
            C.parent = A.parent;
            A.parent = C;

            // A's old parent should point to C
            if (C.parent !== null) {
                if (C.parent.child1 === A) {
                    C.parent.child1 = C;
                } else {
                    // DEBUG: b2Assert(C.parent.child2 === A);
                    C.parent.child2 = C;
                }
            } else {
                this.m_root = C;
            }

            // Rotate
            if (F.height > G.height) {
                C.child2 = F;
                A.child2 = G;
                G.parent = A;
                A.aabb.Combine2(B.aabb, G.aabb);
                C.aabb.Combine2(A.aabb, F.aabb);

                A.height = 1 + Math.max(B.height, G.height);
                C.height = 1 + Math.max(A.height, F.height);
            } else {
                C.child2 = G;
                A.child2 = F;
                F.parent = A;
                A.aabb.Combine2(B.aabb, F.aabb);
                C.aabb.Combine2(A.aabb, G.aabb);

                A.height = 1 + Math.max(B.height, F.height);
                C.height = 1 + Math.max(A.height, G.height);
            }

            return C;
        }

        // Rotate B up
        if (balance < -1) {
            const D = b2Verify(B.child1);
            const E = b2Verify(B.child2);

            // Swap A and B
            B.child1 = A;
            B.parent = A.parent;
            A.parent = B;

            // A's old parent should point to B
            if (B.parent !== null) {
                if (B.parent.child1 === A) {
                    B.parent.child1 = B;
                } else {
                    // DEBUG: b2Assert(B.parent.child2 === A);
                    B.parent.child2 = B;
                }
            } else {
                this.m_root = B;
            }

            // Rotate
            if (D.height > E.height) {
                B.child2 = D;
                A.child1 = E;
                E.parent = A;
                A.aabb.Combine2(C.aabb, E.aabb);
                B.aabb.Combine2(A.aabb, D.aabb);

                A.height = 1 + Math.max(C.height, E.height);
                B.height = 1 + Math.max(A.height, D.height);
            } else {
                B.child2 = E;
                A.child1 = D;
                D.parent = A;
                A.aabb.Combine2(C.aabb, D.aabb);
                B.aabb.Combine2(A.aabb, E.aabb);

                A.height = 1 + Math.max(C.height, D.height);
                B.height = 1 + Math.max(A.height, E.height);
            }

            return B;
        }

        return A;
    }

    public GetHeight(): number {
        if (this.m_root === null) {
            return 0;
        }

        return this.m_root.height;
    }

    public GetAreaRatio(): number {
        if (this.m_root === null) {
            return 0;
        }

        const root = this.m_root;
        const rootArea = root.aabb.GetPerimeter();

        const totalArea = root.GetArea();

        return totalArea / rootArea;
    }

    public ComputeHeight(): number {
        if (this.m_root === null) {
            return 0;
        }
        const height = this.m_root.ComputeHeight();
        return height;
    }

    public ValidateStructure(node: b2TreeNode<T> | null): void {
        if (node === null) {
            return;
        }

        if (node === this.m_root) {
            // DEBUG: b2Assert(node.parent === null);
        }

        if (node.IsLeaf()) {
            // DEBUG: b2Assert(node.child1 === null);
            // DEBUG: b2Assert(node.child2 === null);
            // DEBUG: b2Assert(node.height === 0);
            return;
        }

        const child1 = b2Verify(node.child1);
        const child2 = b2Verify(node.child2);

        // DEBUG: b2Assert(child1.parent === index);
        // DEBUG: b2Assert(child2.parent === index);

        this.ValidateStructure(child1);
        this.ValidateStructure(child2);
    }

    public ValidateMetrics(node: b2TreeNode<T> | null): void {
        if (node === null) {
            return;
        }

        if (node.IsLeaf()) {
            // DEBUG: b2Assert(node.child1 === null);
            // DEBUG: b2Assert(node.child2 === null);
            // DEBUG: b2Assert(node.height === 0);
            return;
        }

        const child1 = b2Verify(node.child1);
        const child2 = b2Verify(node.child2);

        // DEBUG: const height1 = child1.height;
        // DEBUG: const height2 = child2.height;
        // DEBUG: const height = 1 + Math.max(height1, height2);
        // DEBUG: b2Assert(node.height === height);

        // DEBUG: const { aabb } = temp;
        // DEBUG: aabb.Combine2(child1.aabb, child2.aabb);

        // DEBUG: b2Assert(aabb.lowerBound === node.aabb.lowerBound);
        // DEBUG: b2Assert(aabb.upperBound === node.aabb.upperBound);

        this.ValidateMetrics(child1);
        this.ValidateMetrics(child2);
    }

    public Validate(): void {
        // DEBUG: this.ValidateStructure(this.m_root);
        // DEBUG: this.ValidateMetrics(this.m_root);
        // let freeCount: number = 0;
        // let freeIndex: b2TreeNode<T> | null = this.m_freeList;
        // while (freeIndex !== null) {
        //   freeIndex = freeIndex.parent; // freeIndex = freeIndex.next;
        //   ++freeCount;
        // }
        // DEBUG: b2Assert(this.GetHeight() === this.ComputeHeight());
        // b2Assert(this.m_nodeCount + freeCount === this.m_nodeCapacity);
    }

    public GetMaxBalance(): number {
        if (this.m_root === null) {
            return 0;
        }
        return this.m_root.GetMaxBalance();
    }

    /// Build an optimal tree. Very expensive. For testing.
    public RebuildBottomUp(): void {
        /*
    int32* nodes = (int32*)b2Alloc(m_nodeCount * sizeof(int32));
    int32 count = 0;

    // Build array of leaves. Free the rest.
    for (int32 i = 0; i < m_nodeCapacity; ++i) {
      if (m_nodes[i].height < 0) {
        // free node in pool
        continue;
      }

      if (m_nodes[i].IsLeaf()) {
        m_nodes[i].parent = b2_nullNode;
        nodes[count] = i;
        ++count;
      } else {
        FreeNode(i);
      }
    }

    while (count > 1) {
      float32 minCost = b2_maxFloat;
      int32 iMin = -1, jMin = -1;
      for (int32 i = 0; i < count; ++i) {
        b2AABB aabbi = m_nodes[nodes[i]].aabb;

        for (int32 j = i + 1; j < count; ++j) {
          b2AABB aabbj = m_nodes[nodes[j]].aabb;
          b2AABB b;
          b.Combine(aabbi, aabbj);
          float32 cost = b.GetPerimeter();
          if (cost < minCost) {
            iMin = i;
            jMin = j;
            minCost = cost;
          }
        }
      }

      int32 index1 = nodes[iMin];
      int32 index2 = nodes[jMin];
      b2TreeNode<T>* child1 = m_nodes + index1;
      b2TreeNode<T>* child2 = m_nodes + index2;

      int32 parentIndex = AllocateNode();
      b2TreeNode<T>* parent = m_nodes + parentIndex;
      parent.child1 = index1;
      parent.child2 = index2;
      parent.height = 1 + Math.max(child1.height, child2.height);
      parent.aabb.Combine(child1.aabb, child2.aabb);
      parent.parent = b2_nullNode;

      child1.parent = parentIndex;
      child2.parent = parentIndex;

      nodes[jMin] = nodes[count-1];
      nodes[iMin] = parentIndex;
      --count;
    }

    m_root = nodes[0];
    b2Free(nodes);
    */

        this.Validate();
    }

    public ShiftOrigin(newOrigin: XY): void {
        this.m_root?.ShiftOrigin(newOrigin);
    }
}
