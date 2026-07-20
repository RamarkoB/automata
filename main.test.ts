import { assertEquals } from '@std/assert';
import { ParserNodeType, tokenizer, parserReducer } from './main.ts';

const tokenConstructor = (tokens: string[]) => ({
    isValid: true as const,
    tokens,
});

Deno.test('(0+1)*000(0+1)*', () => {
    const lang = '(0+1)*000(0+1)*';
    const tokens = tokenizer(lang);

    assertEquals(
        tokens,
        tokenConstructor([
            '(',
            '0',
            '+',
            '1',
            ')',
            '*',
            '0',
            '0',
            '0',
            '(',
            '0',
            '+',
            '1',
            ')',
            '*',
        ]),
    );
    if (!tokens.isValid) return;

    const parsed = parserReducer(tokens);
    assertEquals(parsed, {
        type: ParserNodeType.Concat,
        nodes: [
            {
                type: ParserNodeType.Star,
                node: {
                    type: ParserNodeType.Paren,
                    node: {
                        type: ParserNodeType.Union,
                        fstNode: { type: ParserNodeType.Char, char: '0' },
                        sndNode: { type: ParserNodeType.Char, char: '1' },
                    },
                    isClosed: true,
                },
            },
            { type: ParserNodeType.Char, char: '0' },
            { type: ParserNodeType.Char, char: '0' },
            { type: ParserNodeType.Char, char: '0' },

            {
                type: ParserNodeType.Star,
                node: {
                    type: ParserNodeType.Paren,
                    node: {
                        type: ParserNodeType.Union,
                        fstNode: { type: ParserNodeType.Char, char: '0' },
                        sndNode: { type: ParserNodeType.Char, char: '1' },
                    },
                    isClosed: true,
                },
            },
        ],
    });
});

Deno.test('b(a+b)*b', () => {
    const lang = 'b(a+b)*b';
    const tokens = tokenizer(lang);
    assertEquals(
        tokens,
        tokenConstructor(['b', '(', 'a', '+', 'b', ')', '*', 'b']),
    );
    if (!tokens.isValid) return;

    const parsed = parserReducer(tokens);
    assertEquals(parsed, {
        type: ParserNodeType.Concat,
        nodes: [
            { type: ParserNodeType.Char, char: 'b' },
            {
                type: ParserNodeType.Star,
                node: {
                    type: ParserNodeType.Paren,
                    node: {
                        type: ParserNodeType.Union,
                        fstNode: { type: ParserNodeType.Char, char: 'a' },
                        sndNode: { type: ParserNodeType.Char, char: 'b' },
                    },
                    isClosed: true,
                },
            },
            { type: ParserNodeType.Char, char: 'b' },
        ],
    });
});

Deno.test('a + ab + abb', () => {
    const lang = 'a + ab + abb';
    const tokens = tokenizer(lang);
    assertEquals(
        tokens,
        tokenConstructor(['a', '+', 'a', 'b', '+', 'a', 'b', 'b']),
    );
    if (!tokens.isValid) return;

    const parsed = parserReducer(tokens);
    assertEquals(parsed, {
        type: ParserNodeType.Union,
        fstNode: {
            type: ParserNodeType.Union,
            fstNode: { type: ParserNodeType.Char, char: 'a' },
            sndNode: {
                type: ParserNodeType.Concat,
                nodes: [
                    { type: ParserNodeType.Char, char: 'a' },
                    { type: ParserNodeType.Char, char: 'b' },
                ],
            },
        },
        sndNode: {
            type: ParserNodeType.Concat,
            nodes: [
                { type: ParserNodeType.Char, char: 'a' },
                { type: ParserNodeType.Char, char: 'b' },
                { type: ParserNodeType.Char, char: 'b' },
            ],
        },
    });
});

Deno.test('a + (ab) + (abb)', () => {
    const lang = 'a + (ab) + (abb)';
    const tokens = tokenizer(lang);
    assertEquals(
        tokens,
        tokenConstructor([
            'a',
            '+',
            '(',
            'a',
            'b',
            ')',
            '+',
            '(',
            'a',
            'b',
            'b',
            ')',
        ]),
    );
    if (!tokens.isValid) return;

    const parsed = parserReducer(tokens);
    assertEquals(parsed, {
        type: ParserNodeType.Union,
        fstNode: {
            type: ParserNodeType.Union,
            fstNode: { type: ParserNodeType.Char, char: 'a' },
            sndNode: {
                type: ParserNodeType.Paren,
                node: {
                    type: ParserNodeType.Concat,
                    nodes: [
                        { type: ParserNodeType.Char, char: 'a' },
                        { type: ParserNodeType.Char, char: 'b' },
                    ],
                },
                isClosed: true,
            },
        },
        sndNode: {
            type: ParserNodeType.Paren,
            node: {
                type: ParserNodeType.Concat,
                nodes: [
                    { type: ParserNodeType.Char, char: 'a' },
                    { type: ParserNodeType.Char, char: 'b' },
                    { type: ParserNodeType.Char, char: 'b' },
                ],
            },
            isClosed: true,
        },
    });
});

Deno.test('(a + (ab) + (abb))*', () => {
    const lang = '(a + (ab) + (abb))*';
    const tokens = tokenizer(lang);
    assertEquals(
        tokens,
        tokenConstructor([
            '(',
            'a',
            '+',
            '(',
            'a',
            'b',
            ')',
            '+',
            '(',
            'a',
            'b',
            'b',
            ')',
            ')',
            '*',
        ]),
    );
    if (!tokens.isValid) return;

    const parsed = parserReducer(tokens);
    assertEquals(parsed, {
        type: ParserNodeType.Star,
        node: {
            type: ParserNodeType.Paren,
            node: {
                type: ParserNodeType.Union,
                fstNode: {
                    type: ParserNodeType.Union,
                    fstNode: { type: ParserNodeType.Char, char: 'a' },
                    sndNode: {
                        type: ParserNodeType.Paren,
                        node: {
                            type: ParserNodeType.Concat,
                            nodes: [
                                { type: ParserNodeType.Char, char: 'a' },
                                { type: ParserNodeType.Char, char: 'b' },
                            ],
                        },
                        isClosed: true,
                    },
                },
                sndNode: {
                    type: ParserNodeType.Paren,
                    node: {
                        type: ParserNodeType.Concat,
                        nodes: [
                            { type: ParserNodeType.Char, char: 'a' },
                            { type: ParserNodeType.Char, char: 'b' },
                            { type: ParserNodeType.Char, char: 'b' },
                        ],
                    },
                    isClosed: true,
                },
            },
            isClosed: true,
        },
    });
});

Deno.test('(a + b)*b(a + b)(a + b)', () => {
    const lang = '(a + b)*b(a + b)(a + b)';
    const tokens = tokenizer(lang);

    assertEquals(
        tokens,
        tokenConstructor([
            '(',
            'a',
            '+',
            'b',
            ')',
            '*',
            'b',
            '(',
            'a',
            '+',
            'b',
            ')',
            '(',
            'a',
            '+',
            'b',
            ')',
        ]),
    );
    if (!tokens.isValid) return;

    const parsed = parserReducer(tokens);
    assertEquals(parsed, {
        type: ParserNodeType.Concat,
        nodes: [
            {
                type: ParserNodeType.Star,
                node: {
                    type: ParserNodeType.Paren,
                    node: {
                        type: ParserNodeType.Union,
                        fstNode: { type: ParserNodeType.Char, char: 'a' },
                        sndNode: { type: ParserNodeType.Char, char: 'b' },
                    },
                    isClosed: true,
                },
            },
            { type: ParserNodeType.Char, char: 'b' },
            {
                type: ParserNodeType.Paren,
                node: {
                    type: ParserNodeType.Union,
                    fstNode: { type: ParserNodeType.Char, char: 'a' },
                    sndNode: { type: ParserNodeType.Char, char: 'b' },
                },
                isClosed: true,
            },
            {
                type: ParserNodeType.Paren,
                node: {
                    type: ParserNodeType.Union,
                    fstNode: { type: ParserNodeType.Char, char: 'a' },
                    sndNode: { type: ParserNodeType.Char, char: 'b' },
                },
                isClosed: true,
            },
        ],
    });
});

Deno.test('(a+b)(a+b)', () => {
    const lang = '(a+b)(a+b)';
    const tokens = tokenizer(lang);
    assertEquals(
        tokens,
        tokenConstructor(['(', 'a', '+', 'b', ')', '(', 'a', '+', 'b', ')']),
    );
    if (!tokens.isValid) return;

    const parsed = parserReducer(tokens);
    assertEquals(parsed, {
        type: ParserNodeType.Concat,
        nodes: [
            {
                type: ParserNodeType.Paren,
                node: {
                    type: ParserNodeType.Union,
                    fstNode: { type: ParserNodeType.Char, char: 'a' },
                    sndNode: { type: ParserNodeType.Char, char: 'b' },
                },
                isClosed: true,
            },
            {
                type: ParserNodeType.Paren,
                node: {
                    type: ParserNodeType.Union,
                    fstNode: { type: ParserNodeType.Char, char: 'a' },
                    sndNode: { type: ParserNodeType.Char, char: 'b' },
                },
                isClosed: true,
            },
        ],
    });
});

Deno.test('(a + b) ( a + b )', () => {
    const lang = '(a + b) ( a + b )';
    const tokens = tokenizer(lang);
    assertEquals(
        tokens,
        tokenConstructor(['(', 'a', '+', 'b', ')', '(', 'a', '+', 'b', ')']),
    );
    if (!tokens.isValid) return;

    const parsed = parserReducer(tokens);
    assertEquals(parsed, {
        type: ParserNodeType.Concat,
        nodes: [
            {
                type: ParserNodeType.Paren,
                node: {
                    type: ParserNodeType.Union,
                    fstNode: { type: ParserNodeType.Char, char: 'a' },
                    sndNode: { type: ParserNodeType.Char, char: 'b' },
                },
                isClosed: true,
            },
            {
                type: ParserNodeType.Paren,
                node: {
                    type: ParserNodeType.Union,
                    fstNode: { type: ParserNodeType.Char, char: 'a' },
                    sndNode: { type: ParserNodeType.Char, char: 'b' },
                },
                isClosed: true,
            },
        ],
    });
});

Deno.test('(( a + (a + b) + b)* (a + b))', () => {
    const lang = '(( a + (a + b) + b)* (a + b))';
    const tokens = tokenizer(lang);
    assertEquals(
        tokens,
        tokenConstructor([
            '(',
            '(',
            'a',
            '+',
            '(',
            'a',
            '+',
            'b',
            ')',
            '+',
            'b',
            ')',
            '*',
            '(',
            'a',
            '+',
            'b',
            ')',
            ')',
        ]),
    );
    if (!tokens.isValid) return;

    const parsed = parserReducer(tokens);
    assertEquals(parsed, {
        type: ParserNodeType.Concat,
        nodes: [
            {
                type: ParserNodeType.Star,
                node: {
                    type: ParserNodeType.Paren,
                    node: {
                        type: ParserNodeType.Union,
                        fstNode: {
                            type: ParserNodeType.Paren,
                            node: {
                                type: ParserNodeType.Union,
                                fstNode: {
                                    type: ParserNodeType.Union,
                                    fstNode: {
                                        type: ParserNodeType.Char,
                                        char: 'a',
                                    },
                                    sndNode: {
                                        type: ParserNodeType.Paren,
                                        node: {
                                            type: ParserNodeType.Char,
                                            char: 'a',
                                        },
                                        isClosed: false,
                                    },
                                },
                                sndNode: {
                                    type: ParserNodeType.Char,
                                    char: 'b',
                                },
                            },
                            isClosed: true,
                        },
                        sndNode: { type: ParserNodeType.Char, char: 'b' },
                    },
                    isClosed: true,
                },
            },
            {
                type: ParserNodeType.Paren,
                node: {
                    type: ParserNodeType.Union,
                    fstNode: { type: ParserNodeType.Char, char: 'a' },
                    sndNode: { type: ParserNodeType.Char, char: 'b' },
                },
                isClosed: true,
            },
        ],
    });
});

Deno.test('(a + b)*abb', () => {
    const lang = '(a + b)*abb';
    const tokens = tokenizer(lang);
    assertEquals(
        tokens,
        tokenConstructor(['(', 'a', '+', 'b', ')', '*', 'a', 'b', 'b']),
    );
    if (!tokens.isValid) return;

    const parsed = parserReducer(tokens);
    assertEquals(parsed, {
        type: ParserNodeType.Concat,
        nodes: [
            {
                type: ParserNodeType.Star,
                node: {
                    type: ParserNodeType.Paren,
                    node: {
                        type: ParserNodeType.Union,
                        fstNode: { type: ParserNodeType.Char, char: 'a' },
                        sndNode: { type: ParserNodeType.Char, char: 'b' },
                    },
                    isClosed: true,
                },
            },
            { type: ParserNodeType.Char, char: 'a' },
            { type: ParserNodeType.Char, char: 'b' },
            { type: ParserNodeType.Char, char: 'b' },
        ],
    });
});

Deno.test('a*b*c*', () => {
    const lang = 'a*b*c*';
    const tokens = tokenizer(lang);
    assertEquals(tokens, tokenConstructor(['a', '*', 'b', '*', 'c', '*']));
    if (!tokens.isValid) return;

    const parsed = parserReducer(tokens);
    assertEquals(parsed, {
        type: ParserNodeType.Concat,
        nodes: [
            {
                type: ParserNodeType.Star,
                node: { type: ParserNodeType.Char, char: 'a' },
            },
            {
                type: ParserNodeType.Star,
                node: { type: ParserNodeType.Char, char: 'b' },
            },
            {
                type: ParserNodeType.Star,
                node: { type: ParserNodeType.Char, char: 'c' },
            },
        ],
    });
});
