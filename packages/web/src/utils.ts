export const base64ToString = (base64: string) => {
    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0) as number);
    return new TextDecoder().decode(bytes);
}

export const strToBase64 = (str: string) => {
    const bytes = new TextEncoder().encode(str);
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString);
}
