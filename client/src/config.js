import axios from 'axios'

const CONFIG = {
    useAvatars: strToBool(process.env.REACT_APP_USE_AVATARS) || false,
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || '',
}

const API = axios.create({
    baseURL: CONFIG.apiBaseUrl,
})

function strToBool(string) {
    if (!string) return false
    const YES_VALUES = ['true', 'yes', 'y', 'on', '1']
    return (YES_VALUES.indexOf(string.toLowerCase()) > -1)
}

export default CONFIG
export {
    API
}