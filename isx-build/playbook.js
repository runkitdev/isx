const { resolve } = require("path");

const { is, data, string } = require("@algebraic/type");
const { List } = require("@algebraic/collections");
const { Optional, None } = require("@algebraic/type/optional");

const { base, getArguments } = require("generic-jsx");

const { Instruction, include } = require("./instruction");

const { hasOwnProperty } = Object;
const extract = (key, properties, fallback) =>
    hasOwnProperty.call(properties, key) ? properties[key] : fallback;


const Playbook = data `Playbook` (
    workspace       => [Optional(string), None],
    from            => string,
    tags            => [List(string), List(string)()],
    instructions    => List(Instruction) );


Playbook.render = playbook =>
[
    `from ${playbook.from}`,
    ...playbook.instructions.map(Instruction.render)
].join("\n");

Playbook.compile = function compile (element)
{
    const args = getArguments(element);
    const f = base(element);
    const fromXML = f.fromXML;

    if (fromXML)
        return fromXML(args);

    if (element === false)
        return false;

    const primitive = Array.isArray(element) ? "array" : typeof element;

    if (primitive === "array")
        return []
            .concat(...element.map(compile)
            .filter(compiled => compiled !== false));

    if (primitive === "function")
        return compile(element());

    if (!is(Instruction, element))
        throw Error(`Unexpected ${type} when evaluating isx.`);

    return element;
}

Playbook.fromXML = function (properties)
{
    const from = extract("from", properties, None);

    if (from === None)
        throw Error("<playbook> must have a from property.");

    const tag = extract("tag", properties, None);
    const tags = List(string)(extract("tags", properties, List(string)()))
        .concat(tag === None ? [] : [tag]);

    const children = extract("children", properties, []);
    const workspace = extract("workspace", properties, None);
    const instructions = List(string)(Playbook.compile(children));

    return Playbook({ from, workspace, tags, instructions });
}


module.exports = Playbook;