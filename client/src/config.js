const CONFIG = {
    useAvatars: strToBool(process.env.REACT_APP_USE_AVATARS) || false,
}

function strToBool(string) {
    if (!string) return false
    const YES_VALUES = ['true', 'yes', 'y', 'on', '1']
    return (YES_VALUES.indexOf(string.toLowerCase()) > -1)
}

export default CONFIG