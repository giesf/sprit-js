import { describe, expect, test } from "bun:test"
import { SSEStream } from "../src/res/SSEStream"



class MockAbortSignal implements AbortSignal {
    aborted = false;
    reason: any = "";
    onabort: ((this: AbortSignal, ev: Event<EventTarget>) => any) | null = null

    addEventListener<K extends "abort">(type: K, listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
    addEventListener(type: unknown, listener: unknown, options?: unknown): void {

    }
    removeEventListener<K extends "abort">(type: K, listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any, options?: boolean | EventListenerOptions | undefined): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): void;
    removeEventListener(type: unknown, listener: unknown, options?: unknown): void {

    }
    dispatchEvent(event: Event<EventTarget>): boolean {
        return true;
    }

}
//@IMPROVE_ME
describe("SSE Stream implementation works", () => {

    test("Very basic text comparison text", async () => {
        const req = { signal: new MockAbortSignal() }
        const stream = new SSEStream({ HOTFIX_signal: req.signal })
        const res = stream.toResponse()

        const bernd = { "foo": "bar" }
        const marie = { "bar": "foo" }
        const roland = 'FOO_BAR'

        stream.sendEvent("bernd", bernd)
        stream.sendEvent("marie", marie)
        stream.sendEvent("roland", roland)
        stream.close()

        const t = await res.text()

        expect(t).toInclude(JSON.stringify(bernd))
        expect(t).toInclude(JSON.stringify(marie))
        expect(t).toInclude(roland)
    })
})
