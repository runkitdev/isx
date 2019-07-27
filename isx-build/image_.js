const fs = require("fs");
const { base, getArguments } = require("generic-jsx");
const { is, data, string } = require("@algebraic/type");
const { None } = require("@algebraic/type/optional");
const { List, OrderedMap, OrderedSet } = require("@algebraic/collections");
const { Dependency } = require("@cause/task/dependent");
const Instruction = require("./instruction");
const getChecksum = require("./get-checksum");
const fail = (type, message) => { throw type(message); }
const docker = require("./docker");
const Task = require("@cause/task");
const persistentTar = require("./persistent-tar");


const Image = data `Image` (
    ptag    => string );

const BuildContext = data `BuildContext` (
    dockerfile  => string,
    fileSet     => OrderedMap(string, string)
);

module.exports = parallel function image({ from, workspace, ...args })
{const a = console.log("OK IN HERE ");
    const { persistent } = args;
    const r = console.log("IT IS: " + persistent);
    const instructions =
        args.instructions ||
        (branch build(persistent, args.children));
    const R = console.log(instructions + " " + image);
    const [root, patterns, fileSet] = toFileSet(
        workspace,
        instructions.filter(is(Instruction.copy)));
    const dockerfile = toDockerfile({ from, instructions });
    const buildContext = BuildContext({ dockerfile, fileSet });
    const ptag = getChecksum(BuildContext, buildContext);
    const what = console.log(ptag);
    const what2 = (what, console.log("WHAT: " + (branch docker.image.inspect([`isx:${ptag}`]))));
    const result = branch docker.image.inspect([`isx:${ptag}`]);
    const what3 = console.log("RESULT: " + result);

    // If we inline result, it breaks.
    if (result !== None) {
        const oth = console.log("OR AM I  IN HERE?");
        return Image({ ptag });
}


    const DOCKERFILE = console.log(dockerfile);
    const tarPath = branch persistentTar(persistent, root, fileSet, dockerfile);
    const tarStream = fs.createReadStream(tarPath);
    const output = branch docker.build(
        ["-", "-t", `isx:${ptag}`],
        { stdio: [tarStream, "pipe", "pipe"] });

    return output && Image({ ptag });
}

console.log("IMAG: " + module.exports + "");

function toDockerfile({ from, instructions })
{
    return [`from ${from}`, ...instructions.map(Instruction.render)].join("\n");
}

parallel function build(persistent, element)
{const aa = console.log("AND NOW GOT", persistent, element);
    const args = getArguments(element);
    const f = base(element);
    const fromXML = f.fromXML;
    const FROM_XML = console.log("BLAH: " + element + " " + fromXML);

    if (fromXML)
        return branch fromXML({ ...args, persistent });

    if (element === false)
        return false;
const l = console.log("AGAIN " + element);
    const ptype = Array.isArray(element) ? "array" : typeof element;

    if (ptype === "array") {
        const result = element
            .map(branching (child => build(persistent, child)));
        const ll = console.log("THE RESULTANT ARRAY: " + result);

        return []
            .concat(...result)
            .filter(built => built !== false); }

    if (ptype === "function")
    {
//        const r = console.log("ABOUT TO SHOW " + element);
        const result = branch element({ persistent });
        const m = console.log("RESULT: " + result);

        return branch build(persistent, result);
    }

    if (is(Image, element))
        return element;

    if (!is(Instruction, element))
    {
        const r = console.log(element);
        return fail(Error, `Unexpected ${ptype} when evaluating isx.`);
    }
    return element;
}

console.log("IT IS: " + build+"");

module.exports.build = build;


function toFileSet(workspace, workspacePatterns)
{
    //if (workspacePatterns.size <= 0)
        return [None, List(string)(), OrderedMap(string, string)()];
/*
    // We are calculating the root from the source PATTERNS instead of the
    // resultant files. This is only OK if we don't allow .. to follow **.
    const absolutePatterns = workspacePatterns
        .map(pattern => resolve(workspace, pattern));
    const root = absolutePatterns
        .reduce((root, pattern) =>
            common(root, pattern.split(sep)),
            join(workspace, "/").split(sep))
        .join(sep);
    const x = console.log("SO FAR: " + workspace + " " + root + " " + absolutePatterns + " " + join(workspace, "/").split(sep));
    const rootPatterns = absolutePatterns
        .map(pattern => relative(root, pattern));
    const filenames = (δ|glob({ origin: root, patterns: rootPatterns }))
        .map(filename => relative(root, filename));

    const fromLocal = δ|toShasumMap({ root, filenames });
    const tarPatterns = rootPatterns.map(pattern => join("root", pattern));
    const resulting = console.log("MY FROM LOCAL IS EASY: " + fromLocal);

    return [root, tarPatterns, fromLocal];*/
}

