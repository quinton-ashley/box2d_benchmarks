// DEBUG: import { b2Assert } from "../common/b2_settings";
import { b2ShapeType } from "../collision/b2_shape";
import { b2Contact } from "./b2_contact";
import { b2CircleContact } from "./b2_circle_contact";
import { b2PolygonContact } from "./b2_polygon_contact";
import { b2PolygonAndCircleContact } from "./b2_polygon_circle_contact";
import { b2EdgeAndCircleContact } from "./b2_edge_circle_contact";
import { b2EdgeAndPolygonContact } from "./b2_edge_polygon_contact";
import { b2ChainAndCircleContact } from "./b2_chain_circle_contact";
import { b2ChainAndPolygonContact } from "./b2_chain_polygon_contact";
import { b2Fixture } from "./b2_fixture";

type CreateFcn = (fixtureA: b2Fixture, indexA: number, fixtureB: b2Fixture, indexB: number) => b2Contact;

interface ContactConstructor {
    new (): b2Contact;
}

export class b2ContactRegister {
    public createFcn: CreateFcn | null = null;

    public destroyFcn: ((contact: b2Contact) => void) | null = null;
}

export class b2ContactFactory {
    public readonly m_registers: b2ContactRegister[][];

    constructor() {
        this.m_registers = Array.from({ length: b2ShapeType.e_shapeTypeCount }, () =>
            Array.from({ length: b2ShapeType.e_shapeTypeCount }, () => new b2ContactRegister()),
        );

        this.AddType(b2CircleContact, b2ShapeType.e_circleShape, b2ShapeType.e_circleShape);
        this.AddType(b2PolygonAndCircleContact, b2ShapeType.e_polygonShape, b2ShapeType.e_circleShape);
        this.AddType(b2PolygonContact, b2ShapeType.e_polygonShape, b2ShapeType.e_polygonShape);
        this.AddType(b2EdgeAndCircleContact, b2ShapeType.e_edgeShape, b2ShapeType.e_circleShape);
        this.AddType(b2EdgeAndPolygonContact, b2ShapeType.e_edgeShape, b2ShapeType.e_polygonShape);
        this.AddType(b2ChainAndCircleContact, b2ShapeType.e_chainShape, b2ShapeType.e_circleShape);
        this.AddType(b2ChainAndPolygonContact, b2ShapeType.e_chainShape, b2ShapeType.e_polygonShape);
    }

    private AddType(Contact: ContactConstructor, typeA: b2ShapeType, typeB: b2ShapeType): void {
        const pool: b2Contact[] = [];
        const poolCreateFcnA: CreateFcn = (fixtureA, indexA, fixtureB, indexB) => {
            const c = pool.pop() ?? new Contact();
            c.Reset(fixtureA, indexA, fixtureB, indexB);
            return c;
        };
        const poolDestroyFcn = (contact: b2Contact) => {
            pool.push(contact);
        };

        const primary = this.m_registers[typeA][typeB];
        primary.createFcn = poolCreateFcnA;
        primary.destroyFcn = poolDestroyFcn;

        if (typeA !== typeB) {
            const poolCreateFcnB: CreateFcn = (fixtureA, indexA, fixtureB, indexB) => {
                const c = pool.pop() ?? new Contact();
                c.Reset(fixtureB, indexB, fixtureA, indexA);
                return c;
            };
            const secondary = this.m_registers[typeB][typeA];
            secondary.createFcn = poolCreateFcnB;
            secondary.destroyFcn = poolDestroyFcn;
        }
    }

    public Create(fixtureA: b2Fixture, indexA: number, fixtureB: b2Fixture, indexB: number): b2Contact | null {
        const typeA: b2ShapeType = fixtureA.GetType();
        const typeB: b2ShapeType = fixtureB.GetType();

        // DEBUG: b2Assert(0 <= typeA && typeA < b2ShapeType.e_shapeTypeCount);
        // DEBUG: b2Assert(0 <= typeB && typeB < b2ShapeType.e_shapeTypeCount);

        const reg: b2ContactRegister = this.m_registers[typeA][typeB];
        return reg.createFcn ? reg.createFcn(fixtureA, indexA, fixtureB, indexB) : null;
    }

    public Destroy(contact: b2Contact): void {
        const typeA: b2ShapeType = contact.m_fixtureA.GetType();
        const typeB: b2ShapeType = contact.m_fixtureB.GetType();

        // DEBUG: b2Assert(0 <= typeA && typeB < b2ShapeType.e_shapeTypeCount);
        // DEBUG: b2Assert(0 <= typeA && typeB < b2ShapeType.e_shapeTypeCount);

        const reg: b2ContactRegister = this.m_registers[typeA][typeB];
        reg.destroyFcn?.(contact);
    }
}
