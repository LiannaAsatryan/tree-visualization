let TreeNode = /** @class */ (function () {
    function TreeNode(data, left=null, right=null, parent=null) {
        if (left === void 0) { left = null; }
        if (right === void 0) { right = null; }
        if (parent === void 0) { parent = null; }
        this.data = data;
        this.left = left;
        this.right = right;
        this.parent = parent; 
        this.refutes = false;
    }

    return TreeNode;
}());


let FONT_SIZE = 20;
//////my code


function getHerbrandBasis(S) {
    const literals = [];

    for (const statement of S) {
        const parts = statement.split(/\sor\s/);

        for (const part of parts) {
            const literal = part.replace(/~/g, "").trim();
            if (!literals.includes(literal)) {
                literals.push(literal);
            }
        }
    }

    return literals;
}

const S = ["P", "Q or P", "~P or ~Q", "~P or ~R"];

function buildTree() {
    let H_basis = getHerbrandBasis(S);

    if (H_basis.length === 0) {
        return null;
    }

    const root = new TreeNode(" ");
    buildTreeHelper(H_basis,null, root, S);
    return root;
}

function buildTreeHelper(H_basis, parent, root, S) {
    if (H_basis.length === 0 || root.refutes) return;

    const string = H_basis[0];
    const node = new TreeNode(string, null, null, root);
    const negation = new TreeNode("~" + string, null, null, root);

    root.left = node;
    root.right = negation;

    const remainingStrings = H_basis.slice(1);
    const filteredStrings = remainingStrings.filter(s => s !== string);
    let variableValues = {};
    collectVariableValues(node, variableValues);

    for (const disjunct of S) {
        if (!satisfiesDisjunct(variableValues, disjunct)) {
            node.refutes = true;
            break;
        }
    }

    variableValues = {};
    collectVariableValues(negation, variableValues);
    for (const disjunct of S) {
        if (!satisfiesDisjunct(variableValues, disjunct)) {
            negation.refutes = true;
            break;
        }
    }
    buildTreeHelper(filteredStrings, node, node, S);
    buildTreeHelper(filteredStrings, node, negation, S);
}

// Define a function to recursively traverse up the tree and collect variable values
function collectVariableValues(currentNode, variableValues) {
    if (currentNode === null || currentNode.data === " ") {
        return;
    }

    if (currentNode.data.startsWith("~")) {
        variableValues[currentNode.data.substring(1)] = 'false';
    } else {
        variableValues[currentNode.data] = 'true';
    }

    collectVariableValues(currentNode.parent, variableValues);
}

function satisfiesDisjunct(variableValues, disjunct) {
    const variables = disjunct.split(/\sor\s/);
    let foundTrue = false;

    for (const variable of variables) {
        const isNegated = variable.startsWith("~");
        const varName = isNegated ? variable.substring(1) : variable;

        if (varName in variableValues) {
            if (isNegated && variableValues[varName] === 'false') {
                foundTrue=true;
                break;
            } else if (!isNegated && variableValues[varName] === 'true') {
                foundTrue=true;
                break;
            }
        } else {
            return true;
        }
    }
    return foundTrue;
}








/* returns the total number of tree levels below this node */
function treeHeight(root, currDepth) {
    if (currDepth === void 0) { currDepth = 0; }
    let left = root.left;
    let right = root.right;
    return Math.max(left != null ? treeHeight(left, currDepth + 1) : currDepth, right != null ? treeHeight(right, currDepth + 1) : currDepth);
}

function drawLineLeftChild(ctx, _x, y, quadrantWidth, levelHeight) {
    let x = _x + 10;
    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x - quadrantWidth / 4, y + levelHeight / 2 - FONT_SIZE - 20);
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawLineRightChild(ctx, _x, y, quadrantWidth, levelHeight) {
    let x = _x + 10;
    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x + 1 + quadrantWidth / 4, y + levelHeight / 2 - FONT_SIZE - 20);
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawNode(canvas, ctx, node, xDepth, yDepth, treeHeight) {
    let _a = canvas.getBoundingClientRect(), width = _a.width -100, height = _a.height;
    let quadrantWidth = width / Math.pow(2, yDepth);
    let levelHeight = height / (treeHeight - 1);
    let quadrantHeight = yDepth * levelHeight;
    let x = quadrantWidth * xDepth + quadrantWidth / 2;
    let y = quadrantHeight / 2+ FONT_SIZE;
    writeNode(ctx, node, x, y);

    if (node.left) {
        drawLineLeftChild(ctx, x, y, quadrantWidth, levelHeight);
        drawNode(canvas, ctx, node.left, 2 * xDepth, yDepth + 1, treeHeight);
    }

    if (node.right) {
        drawLineRightChild(ctx, x, y, quadrantWidth, levelHeight);
        drawNode(canvas, ctx, node.right, 2 * xDepth + 1, yDepth + 1, treeHeight);
    }
}

function writeNode(ctx, treeNode, x, y) {
    let radius = 30;

    if(treeNode.data === " ") {
        radius = 0;
    }

    ctx.font = FONT_SIZE + "px serif";
    ctx.fillText(treeNode.data, x, y);
    ctx.beginPath();
    ctx.arc(x + radius / 3, y - radius / 3, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawTree(canvasId, root) {
    let canvas = document.getElementById(canvasId);
    if (canvas.getContext) {
        let ctx = canvas.getContext("2d");
        let totalTreHeight = treeHeight(root);
        drawNode(canvas, ctx, root, 0, 0, totalTreHeight);
    }
}
