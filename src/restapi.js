export function restbase() {
    return "/api/v1/"
}

export function reserr(error) {
    return error.message ? error.message : error.response.statusText;
}