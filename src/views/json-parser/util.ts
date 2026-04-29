export const PARSE_ERROR_DISPLAY_PREFIX = '⚠ ParseError: '

export interface JsonParseError {
    __json_parse_error__: true
    message: string
    raw: string
}

export function isJsonParseError(val: unknown): val is JsonParseError {
    return (
        typeof val === 'object' &&
        val !== null &&
        '__json_parse_error__' in val &&
        (val as JsonParseError).__json_parse_error__ === true
    )
}

function looksLikeJson(str: string): boolean {
    const trimmed = str.trim()
    if (trimmed.length < 2) return false
    const first = trimmed[0]
    const last = trimmed[trimmed.length - 1]
    return (
        (first === '{' && last === '}') ||
        (first === '[' && last === ']') ||
        (first === '"' && last === '"')
    )
}

function deepParseValue(val: unknown): unknown {
    if (typeof val === 'string') {
        if (!looksLikeJson(val)) return val
        try {
            const parsed: unknown = JSON.parse(val)
            return deepParseValue(parsed)
        } catch (e) {
            const error = e instanceof Error ? e.message : String(e)
            return { __json_parse_error__: true, message: error, raw: val } satisfies JsonParseError
        }
    }
    if (Array.isArray(val)) {
        return val.map(deepParseValue)
    }
    if (typeof val === 'object' && val !== null) {
        const result: Record<string, unknown> = {}
        for (const key of Object.keys(val)) {
            result[key] = deepParseValue((val as Record<string, unknown>)[key])
        }
        return result
    }
    return val
}

export function prepareForDisplay(val: unknown): unknown {
    if (isJsonParseError(val)) {
        return `${PARSE_ERROR_DISPLAY_PREFIX}${val.message}`
    }
    if (Array.isArray(val)) {
        return val.map(prepareForDisplay)
    }
    if (typeof val === 'object' && val !== null) {
        const result: Record<string, unknown> = {}
        for (const key of Object.keys(val)) {
            result[key] = prepareForDisplay((val as Record<string, unknown>)[key])
        }
        return result
    }
    return val
}

export function deepParseJson(input: string): unknown {
    try {
        const parsed: unknown = JSON.parse(input)
        return deepParseValue(parsed)
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e)
        return { __json_parse_error__: true, message: error, raw: input } satisfies JsonParseError
    }
}
