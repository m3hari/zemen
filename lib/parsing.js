const Zemen = require('./zemen');

/**
 * 
 * @param {String} dateString 
 * @param {String} pattern 
 * @return {Zemen}
 * @api public
 * @throws ParsingError
 */
function parse(dateString, pattern) {
    if (!dateString) {
        return "";
    }
    if (!pattern) {
        let result = dateString.split("-");
        if (result.length === 3) {
            let [y, m, d] = result;
            console.log('[y,m,d]',new Zemen(y, m, d));
            return new Zemen(y, m, d);
        } else {
            throw new Error(`ParsingError: Can't parse ${dateString}`)
        }
    }
    parseWithPattern(dateString, pattern);

}

function parseWithPattern(val, pattern) {
    throw new Error('Not implemented Exception :(');
}

module.exports.parse = parse;
