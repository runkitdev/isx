const Scope = require("./scope");
const t = require("@babel/types");
const { parseExpression } = require("@babel/parser");
const transformScope = require("./transform-scope");

const { string } = require("@algebraic/type");
const { Set } = require("@algebraic/collections");


const toLambdaForm = require("@climb/babel-map-accum").fromDefinitions(
{
    BlockStatement(mapAccumNode, node)
    {
        const [[returnPair], declarations] = partition(
            ([, node]) => node.type === "ReturnStatement",
            node.body
                .flatMap(node => node.type === "VariableDeclaration" ?
                    node.declarations : node)
                .map(mapAccumNode));
        const scope = declarations.reduce(
            (lhs, rhs) => Scope.concat(lhs, rhs[0]),
            returnPair[0]);
        const fCallExpression =
            fromDeclarations(declarations, returnPair[1].argument);
        const lambdaForm = t.blockStatement(
            [t.returnStatement(fCallExpression)]);

        return [scope, lambdaForm];
    }
}, transformScope);

function fromDeclarations(declarations, returnExpression)
{
    const combinedScope = declarations.reduce((lhs, rhs) =>
        Scope.concat(lhs, rhs[0]), Scope.identity);
    const [dependent, independent] = partition(([scope]) =>
        scope.free.some(variable => combinedScope.bound.has(variable)),
        declarations);
    const nestedExpression = dependent.length === 0 ?
        returnExpression :
        fromDeclarations(dependent, returnExpression);

    return t.CallExpression(
        t.ArrowFunctionExpression(
            independent.map(([, { id }]) => id),
            nestedExpression),
        independent.map(([, { init }]) => init));
}

function partition(f, list)
{
    const filtered = [];
    const rejected = [];
    
    for (const item of list)
        (f(item) ? filtered : rejected).push(item);

    return [filtered, rejected];
}

module.exports = function (f, free)
{
    const { default: generate } = require("@babel/generator");
    const AST = parseExpression(`(${f})`);
    const [scope, transformed] = require("@climb/babel-map-accum")(Scope, toLambdaForm)(AST);

    const parameters = Object.keys(free || { });
    const missing = scope.free.subtract(parameters);

    if (missing.size > 0)
        throw Error("Missing values for " + missing.join(", "));

    const code = `return ${generate(transformed).code}`;
    const args = parameters.map(parameter => free[parameter]);

    return (new Function(...parameters, code))(...args);
}

