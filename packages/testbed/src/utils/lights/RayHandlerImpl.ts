import { b2World, b2Body, b2Fixture, b2Vec2 } from "@box2d/core";
import { RayHandler, Light, XY } from "@box2d/lights";

export class RayHandlerImpl extends RayHandler {
    private readonly world: b2World;

    public constructor(
        world: b2World,
        gl: WebGLRenderingContext,
        fboWidth: number,
        fboHeight: number,
        viewportWidth: number,
        viewportHeight: number,
    ) {
        super(gl, fboWidth, fboHeight, viewportWidth, viewportHeight);
        this.world = world;
    }

    public createRayCastCallback(light: Light) {
        const cb = (fixture: b2Fixture, point: b2Vec2, _normal: b2Vec2, fraction: number) =>
            light.reportFixture(fixture.GetFilterData(), fixture.GetBody(), point, fraction);
        return (point1: XY, point2: XY) => this.world.RayCast(point1, point2, cb);
    }

    public getBodyPosition(body: any) {
        return (body as b2Body).GetPosition();
    }

    public getBodyAngle(body: any) {
        return (body as b2Body).GetAngle();
    }
}
