//lhs => specific
//rhs => general
const matchScore = (lhs, rhs) => {
    const [lhsPath, lhsToken] = getPathAndToken(lhs)
    const [rhsPath, rhsToken] = getPathAndToken(rhs)

    if (lhsToken !== rhsToken) {
        return 0;
    }

    if (rhsPath.length === 0) {
        return 1;
    }

    if (lhsPath.length === 0) {
        return 0;
    }

    if (lhs === rhs) {
        return Number.MAX_SAFE_INTEGER;
    }

    const rhsIterator = rhsPath[Symbol.iterator]();
    let rhsComponent = rhsIterator.next().value

    let score = 0;
     // The score value of the current component - this goes down each time i.e. starts at the maximum and works its way down
    let nextScore = 1 << (lhsPath.length * 2)

    for (const lhsComponent of lhsPath) {
        // If the lhs doesn't match the rhs component, move on to the next one
        if (getComponentWithoutVariant(lhsComponent) !== getComponentWithoutVariant(rhsComponent)) {
            nextScore /= 4;
            continue;
        }

        score += nextScore/2

        // Check for variants
        const lhsVariant = getVariant(lhsComponent);
        const rhsVariant = getVariant(rhsComponent);

        if (lhsVariant == null && rhsVariant == null) {
            // Do nothing variants not present
        } else if (lhsVariant != null && rhsVariant == null) {
            // To nothing, specific has variant, general doesn't care
        } else if (lhsVariant != null && rhsVariant != null && lhsVariant === rhsVariant) {
            score += nextScore
        } else {
            // If there are variants which don't match, this is a hard fail
            return 0
        }

        // Move on to the next rhs component - and if we are at the end, we have matched and just return the score
        rhsComponent = rhsIterator.next().value
        if (rhsComponent == null) {
            return score
        }

        // Each component in the lhs which matches is more important than the last one.
        // Increase it's score to take that into account
        nextScore /= 4;
    }
    return 0;
}

const getPathAndToken = (from) => {
    const elements = from.split("/")
    const token = elements.pop()
    return [elements.reverse(), token]
}

const getVariant = (component) => {
    const matches = component.match(/\[.+\]/g);
    if (matches && matches.length) {
        return matches[0]
    }
    return null
}

const getComponentWithoutVariant = (component) => {
    if (component.includes("[")) {
        return component.split("[")[0]
    }
    return component
}

module.exports = {matchScore}
