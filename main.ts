enum ParserNodeType {
    Star = 'Star',
    Concat = 'Concat',
    Paren = 'Paren',
    Union = 'Union',
    Char = 'Char',
}

enum ASTNodeType {
    Star,
    Concat,
    Union,
}

type TokenizerOutput =
    | { isValid: true; tokens: string[] }
    | { isValid: false; err: string };

type ParserNode =
    | undefined
    | { type: ParserNodeType.Star; node: ParserNode }
    | { type: ParserNodeType.Concat; nodes: ParserNode[] }
    | { type: ParserNodeType.Paren; node: ParserNode; isClosed: boolean }
    | { type: ParserNodeType.Union; fstNode: ParserNode; sndNode: ParserNode }
    | { type: ParserNodeType.Char; char: string };

type ASTNode =
    | { type: ASTNodeType.Star; node: ASTNode }
    | { type: ASTNodeType.Concat; nodes: ASTNode[] }
    | { type: ASTNodeType.Union; fstNode: ASTNode; sndNode: ASTNode }
    | string;

const isLetter = (char: string) => /^[a-z0-1]$/.test(char); // accepts lowercase letters
const isSymbol = (char: string) => /(ε|\(|\)|\+|\*)/.test(char); // accepted symbols: "ε", "(", ")", "+" and "*"
const isValid = (char: string) => isLetter(char) || isSymbol(char);

const tokenizer = (input: string): TokenizerOutput =>
    input
        .split('')
        .filter((char) => char !== ' ')
        .reduce<TokenizerOutput>(
            (acc, char) =>
                !acc.isValid ? acc
                : !isValid(char) ?
                    {
                        isValid: false,
                        err: `Invalid Token: "${char}". Accepted inputs are numbers, lowercase letters, and the following symbols: "(", ")", "+" and "*"`,
                    }
                :   { isValid: true, tokens: [...acc.tokens, char] },
            { isValid: true, tokens: [] },
        );

const canAppend = (node: ParserNode): boolean => {
    switch (node?.type) {
        case undefined:
        case ParserNodeType.Char:
        case ParserNodeType.Star:
            return false;

        case ParserNodeType.Union:
            return true;

        case ParserNodeType.Paren:
            return !node.isClosed;

        case ParserNodeType.Concat:
            return node.nodes.length === 0 || canAppend(node.nodes.at(-1));
    }
};

const hasOpenParen = (tree: ParserNode): boolean => {
    switch (tree?.type) {
        case undefined:
        case ParserNodeType.Char:
        case ParserNodeType.Star:
            return false;

        case ParserNodeType.Union:
            return hasOpenParen(tree.sndNode);

        case ParserNodeType.Concat:
            return hasOpenParen(tree.nodes.at(-1));

        case ParserNodeType.Paren:
            return !tree.isClosed || hasOpenParen(tree.node);
    }
};

const appendNode = (tree: ParserNode, newNode: ParserNode): ParserNode => {
    switch (tree?.type) {
        case undefined:
            return newNode;

        case ParserNodeType.Char:
            return { type: ParserNodeType.Concat, nodes: [tree, newNode] };

        case ParserNodeType.Star:
            return { type: ParserNodeType.Concat, nodes: [tree, newNode] };

        case ParserNodeType.Concat:
            return {
                type: ParserNodeType.Concat,
                nodes:
                    canAppend(tree) ?
                        [
                            ...tree.nodes.slice(0, -1),
                            appendNode(tree.nodes.at(-1), newNode),
                        ]
                    :   [...tree.nodes, newNode],
            };

        case ParserNodeType.Paren:
            if (!canAppend(tree)) {
                return { type: ParserNodeType.Concat, nodes: [tree, newNode] };
            } else {
                return {
                    type: ParserNodeType.Paren,
                    node: appendNode(tree.node, newNode),
                    isClosed: false,
                };
            }

        case ParserNodeType.Union:
            return {
                type: ParserNodeType.Union,
                fstNode: tree.fstNode,
                sndNode: appendNode(tree.sndNode, newNode),
            };
    }
};

// the token string should always be of length 1
const parser = (tree: ParserNode, token: string): ParserNode => {
    switch (token) {
        case '+': {
            switch (tree?.type) {
                case ParserNodeType.Paren: {
                    return tree.isClosed ?
                            {
                                type: ParserNodeType.Union,
                                fstNode: tree,
                                sndNode: undefined,
                            }
                        :   {
                                type: ParserNodeType.Paren,
                                node: parser(tree.node, '+'),
                                isClosed: false,
                            };
                }

                case ParserNodeType.Concat:
                    return canAppend(tree) ?
                            {
                                type: ParserNodeType.Concat,
                                nodes: [
                                    ...tree.nodes.slice(0, -1),
                                    parser(tree.nodes.at(-1), '+'),
                                ],
                            }
                        :   {
                                type: ParserNodeType.Union,
                                fstNode: tree,
                                sndNode: undefined,
                            };

                case ParserNodeType.Union:
                    return {
                        type: ParserNodeType.Union,
                        fstNode: tree.fstNode,
                        sndNode: parser(tree.sndNode, '+'),
                    };
            }

            // if tree is undefined or type is "Star" or "Char"
            return tree !== undefined ?
                    {
                        type: ParserNodeType.Union,
                        fstNode: tree,
                        sndNode: undefined,
                    }
                :   tree;
        }

        case '*': {
            switch (tree?.type) {
                case ParserNodeType.Paren:
                    return tree.isClosed ?
                            { type: ParserNodeType.Star, node: tree }
                        :   {
                                type: ParserNodeType.Paren,
                                node: parser(tree.node, '*'),
                                isClosed: false,
                            };

                case ParserNodeType.Concat:
                    return {
                        type: ParserNodeType.Concat,
                        nodes: [
                            ...tree.nodes.slice(0, -1),
                            parser(tree.nodes.at(-1), '*'),
                        ],
                    };

                case ParserNodeType.Union:
                    return {
                        type: ParserNodeType.Union,
                        fstNode: tree.fstNode,
                        sndNode: parser(tree.sndNode, '*'),
                    };
            }

            // if tree is undefined or type is "Star" or "Char"
            return tree !== undefined ?
                    { type: ParserNodeType.Star, node: tree }
                :   tree;
        }

        case ')': {
            switch (tree?.type) {
                case ParserNodeType.Paren: {
                    return (
                        tree.isClosed ? tree
                        : hasOpenParen(tree.node) ?
                            { ...tree, node: parser(tree.node, ')') }
                        :   { ...tree, isClosed: true }
                    );
                }

                case ParserNodeType.Concat:
                    return {
                        type: ParserNodeType.Concat,
                        nodes: [
                            ...tree.nodes.slice(0, -1),
                            parser(tree.nodes.at(-1), ')'),
                        ],
                    };

                case ParserNodeType.Union:
                    return {
                        type: ParserNodeType.Union,
                        fstNode: tree.fstNode,
                        sndNode: parser(tree.sndNode, ')'),
                    };
            }

            // if tree is undefined or type is "Star" or "Char"
            return tree;
        }

        case '(': {
            return appendNode(tree, {
                type: ParserNodeType.Paren,
                node: undefined,
                isClosed: false,
            });
        }

        default: {
            // char case: ε, a-z or 0-1
            return appendNode(tree, {
                type: ParserNodeType.Char,
                char: token,
            });
        }
    }
};

const parserReducer = ({ tokens }: TokenizerOutput & { isValid: true }) =>
    tokens.reduce<ParserNode>(parser, undefined);

const parserNodeToString = (tree: ParserNode): string => {
    switch (tree?.type) {
        case undefined:
            return '';

        case ParserNodeType.Char:
            return tree.char;

        case ParserNodeType.Star:
            return `${parserNodeToString(tree.node)}*`;

        case ParserNodeType.Concat:
            return tree.nodes.map(parserNodeToString).join('');

        case ParserNodeType.Union:
            return `${parserNodeToString(tree.fstNode)}+${parserNodeToString(tree.sndNode)}`;

        case ParserNodeType.Paren:
            return tree.isClosed ?
                    `(${parserNodeToString(tree.node)})`
                :   `(${parserNodeToString(tree.node)}`;
    }
};

const printTokenizerOutput = (output: TokenizerOutput) => {
    if (output.isValid) {
        console.log(output.tokens);
    } else {
        console.log(output.err);
    }
};

const interpret = (input: string, withTree = false, withTokens = false) => {
    console.log(`\n${input}`);
    const tokens = tokenizer(input);
    if (withTokens) printTokenizerOutput(tokens);

    if (!tokens.isValid) return;
    const parsed = parserReducer(tokens);

    if (withTree) {
        console.log(Deno.inspect(parsed, { depth: Infinity, colors: true }));
    }

    console.log(parserNodeToString(parsed), '\n');
};

// interpret('0+1');
// interpret('(0+1)*000(0+1)*');
interpret('b(a+b)*b', true);
// interpret('a + ab + ab');
// interpret('a + (ab) + (abb)');
// interpret('(a + (ab) + (abb))*');
// interpret('(a + b)*b(a + b)(a + b)');
// interpret('(a+b)(a+b)');
// interpret('(a + b) ( a + b )');
// interpret('(a + b)*abb');
// interpret('a*b*c*');
// interpret('(( a + (a + b) + b + ab)* (a + b))');
// interpret('(( a + b ))');

export { tokenizer, parserReducer, ParserNodeType };
