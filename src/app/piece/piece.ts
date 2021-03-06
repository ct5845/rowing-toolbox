import {Stroke} from '../strokes/stroke';
import {DateTime, Duration} from 'luxon';
import {Session} from '../sessions/session';
import shortid from 'shortid';

export class Piece {
    public id: string;
    public sessionId: string;
    public name: string;
    public strokeCount = 0;
    public distance = 0;
    public duration: string;
    public averages: Stroke;
    public start: number;
    public end: number;
    public from: string;
    public to: string;

    static fromRange(start: number, end: number, session: Session, strokes?: Stroke[]): Piece {
        strokes = strokes || session.strokes;
        const piece = new Piece(null, session.id);

        piece.start = start;
        piece.end = end;

        piece.from = DateTime.fromISO(session.details.session.date).plus(Duration.fromISO(strokes[ start ].timeElapsed)).toISO();
        piece.to = DateTime.fromISO(session.details.session.date).plus(Duration.fromISO(strokes[ end ].timeElapsed)).toISO();

        if (start === -1 || end === -1 || start >= end) {
            return piece;
        }

        piece.strokeCount = (end - start) + 1;
        piece.distance = strokes[ end ].distanceGPS - strokes[ start ].distanceGPS;
        piece.duration = Duration.fromISO(strokes[ end ].timeElapsed).minus(Duration.fromISO(strokes[ start ].timeElapsed)).toISO();

        piece.averages = Piece.calculateAverages(strokes, start, end);

        return piece;
    }

    static calculateAverages(strokes: Stroke[], start: number, end: number): Stroke {
        const averages = new Stroke();
        const strokeCounter = new Stroke();

        for (let i = start; i <= end; i++) {
            averages.add(strokes[ i ], strokeCounter);

        }

        averages.average(strokeCounter);

        return averages;
    }

    constructor(id?: string, sessionId?: string) {
        this.id = id || shortid();
        this.sessionId = sessionId;
    }

    copy(): Piece {
        const piece = Object.assign(new Piece(), this);

        piece.averages = piece.averages.copy();

        return piece;
    }

    toFirestore(): any {
        const obj: any = {...this};

        obj.averages = this.averages.toFirestore();

        return obj;
    }
}
