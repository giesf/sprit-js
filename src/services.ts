export class ServiceNotInitializedError extends Error { }
export class ServiceAlreadyInitializedError extends Error { }
export class ServiceIsImmutableError extends Error { }



export function makeService<T extends object>(): [() => T, (s: T | undefined, override?: boolean) => void] {

    let _service: T | undefined;


    return [
        () => {
            if (!_service) throw new ServiceNotInitializedError()
            return new Proxy(_service, {
                get: (target: any, prop) => {
                    // Fixes weird private field behaviour
                    if ((_service as any)[prop] instanceof Function) {
                        return (_service as any)[prop].bind(_service);
                    }
                    return (_service as any)[prop];

                }, set: () => { throw new ServiceIsImmutableError() }
            })
        },
        (s: T | undefined, override: boolean = false) => {
            if (_service && override === false) throw new ServiceAlreadyInitializedError()

            _service = s;
        }
    ]
}