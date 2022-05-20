const filterResult = (arr: any, value: any) => {
    let strList = JSON.stringify(arr)
    if (value === 'volatility') {
        if (strList.search('increase') !== -1 || strList.search('decline') !== -1) {
            return true
        } else {
            return false
        }
    }
    if (strList.search(value) !== -1) {
        return true
    }
    return false
}

export {
    filterResult
}