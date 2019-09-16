const DENVELOPE_SEPARATOR = ":"
const ENCORDER_SEPARATOR = "//"
const STATUSES = {
    "-3": {
        displayValue: "Дублікат",
        value: "duplicate"
    },
    "-2": {
        displayValue: "Не просканований",
        value: "unscanned"
    },
    "-1": {
        displayValue: "Замінено на новий",
        value: "revoked"
    },
    "0": {
        displayValue: "Зіпсовано",
        value: "spoilt"
    }
}

/**
 * No padding mode constant from node-rsa library.
 * https://github.com/rzcoder/node-rsa/issues/72
 */
const RSA_NO_PADDING = 3

export {
    DENVELOPE_SEPARATOR,
    ENCORDER_SEPARATOR,
    STATUSES,
    RSA_NO_PADDING,
}