import { EventEmitter } from "events";

export class SSEStream {

    private events = new EventEmitter()

    private onClose: Function | undefined;

    private streamController?: ReadableStreamController<any>

    public sendEvent(eventName: string, data: any) {
        const eventPayload = `event: ${eventName}\ndata: ${typeof data != "string" ? JSON.stringify(data) : data}\n\n`
        console.debug(eventPayload)

        this.events.emit(
            "sse",
            eventPayload
        );
    };

    public close() {
        this.events.removeAllListeners("sse");
        this.streamController && this.streamController.close()
        this.onClose && this.onClose()
    }

    private readableStream: ReadableStream
    constructor(options: { HOTFIX_signal: Request["signal"], retryInterval?: number, onClose?: Function }) {
        this.onClose = options?.onClose;

        options.HOTFIX_signal.addEventListener("abort", () => {
            this.close()
        })

        this.readableStream = new ReadableStream({
            start: (controller) => {
                this.streamController = controller;
                this.events.once("sse", () => {
                    controller.enqueue(`retry: ${options?.retryInterval || 3000}\n\n`);
                });
                this.events.on("sse", (data) => {

                    controller.enqueue(data);

                });
            },
        });

    }

    public toResponse() {
        return new Response(this.readableStream, {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "text/event-stream;charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
                "X-Accel-Buffering": "no",
            },
        });
    }
}