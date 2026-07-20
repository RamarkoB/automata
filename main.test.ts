import { assertEquals } from '@std/assert';
import { tokenizer } from './main.ts';

const tokenConstructor = (tokens: string[]) => ({
    isValid: true as const,
    tokens,
});

Deno.test('lang1', () => {
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

    // const parsed = parser(tokens);
    // assertEquals(parsed, { type: ParserNodeType.Concat, nodes: [{}, {}] });
});

Deno.test('lang2', () => {
    const lang = 'b(a+b)*b';
    const tokens = tokenizer(lang);
    assertEquals(
        tokens,
        tokenConstructor(['b', '(', 'a', '+', 'b', ')', '*', 'b']),
    );
    if (!tokens.isValid) return;

    // const parsed = parser(tokens);
    // assertEquals(parsed);
});

Deno.test('lang3', () => {
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

    // const parsed = parser(tokens);
    // assertEquals(parsed);
});

Deno.test('lang4', () => {
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

    // const parsed = parser(tokens);
    // assertEquals(parsed);
});

Deno.test('lang5', () => {
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

    // const parsed = parser(tokens);
    // assertEquals(parsed);
});

Deno.test('lang6', () => {
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

    // const parsed = parser(tokens);
    // assertEquals(parsed);
});

Deno.test('lang7', () => {
    const lang = '(a + b) ( a + b )';
    const tokens = tokenizer(lang);
    assertEquals(
        tokens,
        tokenConstructor(['(', 'a', '+', 'b', ')', '(', 'a', '+', 'b', ')']),
    );
    if (!tokens.isValid) return;

    // const parsed = parser(tokens);
    // assertEquals(parsed);
});

Deno.test('lang8', () => {
    const lang = '(a + b)*abb';
    const tokens = tokenizer(lang);
    assertEquals(
        tokens,
        tokenConstructor(['(', 'a', '+', 'b', ')', '*', 'a', 'b', 'b']),
    );
    if (!tokens.isValid) return;

    // const parsed = parser(tokens);
    // assertEquals(parsed);
});

Deno.test('lang9', () => {
    const lang = 'a*b*c*';
    const tokens = tokenizer(lang);
    assertEquals(tokens, tokenConstructor(['a', '*', 'b', '*', 'c', '*']));
    if (!tokens.isValid) return;

    // const parsed = parser(tokens);
    // assertEquals(parsed);
});
