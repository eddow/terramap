import {Event} from 'typescript.events'
import Point from './geometry/point'

export type PointComputer = (points: [Point, Point])=> Point
export interface Generation {
	initials: [any, any, any, any];
	pointComputer: PointComputer;
}
export default class ITerraMap extends Event {
	pointComputer: PointComputer;
}
