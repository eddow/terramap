import {Event} from 'typescript.events'

export type PointComputer<P> = (points: [P, P])=> P
export interface Generation<P> {
	initials: [P, P, P, P];
	pointComputer: PointComputer<P>;
}
export default class ITerraMap<P> extends Event {
	pointComputer: PointComputer<P>;
}
