declare module 'say' {
    export function speak(text: string, voice: string, speed: number, cb: ((error: Error) => void)): void;
}
