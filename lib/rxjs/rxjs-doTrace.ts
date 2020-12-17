import * as _ from 'lodash';
import {combineLatest, Observable, OperatorFunction} from 'rxjs';

export type LogDetail = 'Debug' | 'Info' | 'None'
const DEFAULT_LOG_DETAIL: LogDetail = 'Debug';

function shortToString(x) {
    if (_.isNil(x)) {
        return x;
    } else {
        if (x instanceof Array) {
            return 'Array of ' + x.length + '=[' + _.join(_.slice(x, 0, 10).map(i => shortToString(i)), ', ') + ']';
        } else {
            const typ = typeof x;
            return (typ === 'object' && x.constructor ? x.constructor.name : typ) + '"' + x.toString() + '"';
        }
    }
}


/**
 * Transforms an observable of BeanWrapper or of ArrayLike into an observable of a single Bean (the first one or null if none)
 * If the tracePrefix is undefined, will use the calling line (but unfortunately in webpack format.
 * If the input is a BeanWrapper, it filters ready
 *
 * All traced observable are accessible in the console, typing `dwDoTraceMgr`
 *
 */
export function doTrace<T>(tracePrefix?: string, logDetail: LogDetail = DEFAULT_LOG_DETAIL, logger = defaultLogger): OperatorFunction<T, T> {

    if (!tracePrefix) {
        const stackLine = (new Error).stack.split(/\r\n|\n/)[2];
        tracePrefix = stackLine.replace(/ * at +.*\((.*:[0-9]+:[0-9]+)\).*/, '$1');
    }

    const watcher = new DoTraceWatcher(tracePrefix);
    if (logDetail !== 'None') {
        logger(`${watcher} created`);
    }
    return function (source: Observable<T>) {
        return new Observable<T>(function (subscriber) {
            // because we're in an arrow function `this` is from the outer scope.

            let thisTracePrefix = null;
            if (logDetail !== 'None') {
                thisTracePrefix = `SUB#${(watcher.addSub())}`;
                source['sourceTracePrefix'] = thisTracePrefix;
                logger(`${watcher} ${thisTracePrefix} subscribed`);
            }

            // save our inner subscription
            const subscription = source.subscribe(function (x) {
                    // important: catch errors from user-provided callbacks
                    try {
                        if (logDetail === 'Debug') {
                            logger(`${watcher} ${thisTracePrefix} next: ${shortToString(x)}`, x);
                        }
                        subscriber.next(x);
                    } catch (err) {
                        if (logDetail !== 'None') {
                            logger(`${watcher} ${thisTracePrefix} err: ${err}`, err);
                        }
                        subscriber.error(err);
                    }
                },
                // be sure to handle errors and completions as appropriate and
                // send them along
                function (err) {
                    if (logDetail !== 'None') {
                        logger(`${watcher} ${thisTracePrefix} error: ${err}`);
                    }
                    return subscriber.error(err);
                },
                function () {
                    if (logDetail !== 'None') {
                        logger(`${watcher} ${thisTracePrefix} Completed`);
                    }
                    return subscriber.complete();
                });

            subscription.add(function () {
                watcher.removeSub();
                if (logDetail !== 'None') {
                    logger(`${watcher} ${thisTracePrefix} unsubscribed`);
                }
            });
            return subscription;
        });
    };
}

function defaultLogger(event: any, ...optionalParams: any) {
    return console.log(event, ...optionalParams);
}


export function doTrace$Lst<A, B, C, D, E>(prefix: string, lst: [Observable<A>, Observable<B>, Observable<C>, Observable<D>, Observable<E>]): [Observable<A>, Observable<B>, Observable<C>, Observable<D>, Observable<E>]
export function doTrace$Lst<A, B, C, D>(prefix: string, lst: [Observable<A>, Observable<B>, Observable<C>, Observable<D>]): [Observable<A>, Observable<B>, Observable<C>, Observable<D>]
export function doTrace$Lst<A, B, C>(prefix: string, lst: [Observable<A>, Observable<B>, Observable<C>]): [Observable<A>, Observable<B>, Observable<C>]
export function doTrace$Lst<A, B>(prefix: string, lst: [Observable<A>, Observable<B>]): [Observable<A>, Observable<B>]
export function doTrace$Lst<T>(prefix: string, lst: Observable<T>[]): Observable<T>[]
export function doTrace$Lst<T>(prefix: string, lst: Observable<T>[]): Observable<T>[] {
    return lst.map((o, i) => o.pipe(doTrace(prefix + '-' + i, 'Debug')));
}

let doTrace$combineLatestTCounter = 0;

export function combineLatestT<A, B, C, D, E, F, G>(prefix: string, lst: [Observable<A>, Observable<B>, Observable<C>, Observable<D>, Observable<E>, Observable<F>, Observable<G>]): Observable<[A, B, C, D, E, F, G]>
export function combineLatestT<A, B, C, D, E, F>(prefix: string, lst: [Observable<A>, Observable<B>, Observable<C>, Observable<D>, Observable<E>, Observable<F>]): Observable<[A, B, C, D, E, F]>
export function combineLatestT<A, B, C, D, E>(prefix: string, lst: [Observable<A>, Observable<B>, Observable<C>, Observable<D>, Observable<E>]): Observable<[A, B, C, D, E]>
export function combineLatestT<A, B, C, D>(prefix: string, lst: [Observable<A>, Observable<B>, Observable<C>, Observable<D>]): Observable<[A, B, C, D]>
export function combineLatestT<A, B, C>(prefix: string, lst: [Observable<A>, Observable<B>, Observable<C>]): Observable<[A, B, C]>
export function combineLatestT<A, B>(prefix: string, lst: [Observable<A>, Observable<B>]): Observable<[A, B]>
export function combineLatestT<A>(prefix: string, lst: Observable<A>[]): Observable<A[]> {
    const cnt = doTrace$combineLatestTCounter++;
    const prefix2 = prefix + '-' + cnt;
    return combineLatest(doTrace$Lst(prefix2, lst)).pipe(doTrace(prefix2 + '-result'));
}

export function combineLatestTT<A, B, C, D, E, F>(lst: [Observable<A>, Observable<B>, Observable<C>, Observable<D>, Observable<E>, Observable<F>]): Observable<[A, B, C, D, E, F]>
export function combineLatestTT<A, B, C, D, E>(lst: [Observable<A>, Observable<B>, Observable<C>, Observable<D>, Observable<E>]): Observable<[A, B, C, D, E]>
export function combineLatestTT<A, B, C, D>(lst: [Observable<A>, Observable<B>, Observable<C>, Observable<D>]): Observable<[A, B, C, D]>
export function combineLatestTT<A, B, C>(lst: [Observable<A>, Observable<B>, Observable<C>]): Observable<[A, B, C]>
export function combineLatestTT<A, B>(lst: [Observable<A>, Observable<B>]): Observable<[A, B]>
export function combineLatestTT<A>(lst: Observable<A>[]): Observable<A[]> {
    const stackLine = (new Error).stack.split(/\r\n|\n/)[2];
    const cnt = doTrace$combineLatestTCounter++;
    const prefix = stackLine.replace(/ * at +.*\((.*:[0-9]+:[0-9]+)\).*/, '$1') + '-' + cnt;
    return combineLatest(doTrace$Lst(prefix, lst)).pipe(doTrace(prefix + '-result'));
}

class DoTraceWatcher {
    subscriberCount = 0;
    desubscribed = 0;
    readonly tracePrefix: string;
    readonly stack: string;

    constructor(tracePrefix: string) {
        this.tracePrefix = (dwDoTraceMgr.watcherCount++) + '#' + tracePrefix;
        this.stack = Error().stack;
        dwDoTraceMgr.register(this);
    }

    toString() {
        return `${this.tracePrefix}(${this.subscriberCount}-${this.desubscribed})`;
    }

    addSub() {
        dwDoTraceMgr.register(this); // in case it was completely desubscribed and therefore removed from the set
        return this.subscriberCount++;
    }

    removeSub() {
        this.desubscribed++;
        if (this.desubscribed === this.subscriberCount) {
            dwDoTraceMgr.unregister(this);
        }
    }
}

export class DoTraceMgr {
    watcherCount = 0;

    private set = new Set<DoTraceWatcher>();

    register(doTraceWatcher: DoTraceWatcher) {
        this.set.add(doTraceWatcher);
    }

    unregister(doTraceWatcher: DoTraceWatcher) {
        this.set.delete(doTraceWatcher);
    }

    toString() {
        return Array.from(this.set).join('\n');
    }
}

const dwDoTraceMgr = new DoTraceMgr();
window['dwDoTraceMgr'] = dwDoTraceMgr;
