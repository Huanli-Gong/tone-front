const filterResult = (arr: any, value: any) => {
    const strList = JSON.stringify(arr)
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

const conversion = (item: any) => {
    if (JSON.stringify(item) === '{}') {
        return '-'
    }
    return `${item.test_value}±${item.cv_value}`
}

export {
    filterResult,
    conversion
}