import { describe, expect, test } from "bun:test"
import { ServiceIsImmutableError, makeService } from "../src/services";

describe("Service creation works as intended", () => {

    test("Basic smoke test", async () => {
        const initialServiceResponse = "Hello, world!";
        const initialService = {
            mockFunc: () => initialServiceResponse
        }

        const [useService, setService] = makeService<typeof initialService>()

        setService(initialService);

        const service = useService()

        const serviceResponse = service.mockFunc()

        expect(serviceResponse).toBe(initialServiceResponse)
    })

    test("Supports in-flight service replacement", async () => {
        const initialServiceResponse = "Hello, world!";
        const initialService = {
            mockFunc: () => initialServiceResponse
        }

        const alternateServiceResponse = "Hello, Otto!";
        const alternateService = {
            mockFunc: () => alternateServiceResponse
        }

        const [useService, setService] = makeService<typeof initialService>()

        setService(initialService);

        const service = useService()

        const serviceResponse = service.mockFunc()

        expect(serviceResponse).toBe(initialServiceResponse)

        setService(alternateService, true)

        const secondServiceResponse = service.mockFunc()
        console.log(secondServiceResponse)

        expect(secondServiceResponse).toBe(alternateServiceResponse)
    })

    test("UseService hook makes service properties immutable", async () => {

        expect(() => {
            const initialServiceResponse = "Hello, world!";
            const initialService = {
                mockFunc: () => initialServiceResponse
            }

            const alternateServiceResponse = "Miau"

            const [useService, setService] = makeService<typeof initialService>()

            setService(initialService);

            const service = useService()

            service.mockFunc = () => alternateServiceResponse;

            const serviceResponse = service.mockFunc()
            expect(serviceResponse).toBe(initialServiceResponse)


        }).toThrow(new ServiceIsImmutableError())
    })


})