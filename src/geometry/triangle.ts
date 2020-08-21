import Point from './point'
import Edge, {TriangleInterface} from './edge'

export type TrianglePoints = [Point, Point, Point];

export default class Triangle implements TriangleInterface {
	OuterEdges: [Edge, Edge, Edge];
	InnerEdges: [Edge?, Edge?, Edge?];
	constructor(a: Edge, b: Edge, c: Edge) {
		this.InnerEdges = [];
		(this.OuterEdges = [a, b, c]).forEach(dg=> {
			dg.borderOf[dg.borderOf[0]?1:0] = this;
		});
	}
	get points() : TrianglePoints {
		const dg = this.OuterEdges;
		const rv = [dg[0].ends[0], dg[0].ends[1]];
		const d1e0 = dg[1].ends[0];
		rv.push(~rv.indexOf(d1e0)?dg[1].ends[1]:d1e0);
		console.assert(
			~rv.indexOf(dg[1].ends[1]) &&
			~rv.indexOf(dg[2].ends[0]) &&
			~rv.indexOf(dg[2].ends[1]),
			'Consistant edging of triangle'
		);
		return rv as TrianglePoints;
	}
}