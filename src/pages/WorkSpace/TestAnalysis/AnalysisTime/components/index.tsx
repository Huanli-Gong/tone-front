export function textTip(title: string, data: any) {
    return data ? `${title}：${data}<br />` : ''
}

export function commitLinkTip(title: string, commit: any, ws_id: any) {
    if (!ws_id) {
        if (commit) return `${title}: ${commit}`
    }
    return commit ? `${title}: <a href=${`/ws/${ws_id}/test_result/${commit}`} target="_blank">#${commit}</a><br />` : ''
}

export function serverLinkTip(ip: any) {
    return ip ?
        `测试机器: <span>${ip}</span><br />` :
        ''
}

export const renderProviderText = (i: any, provider: string) => {
    return `${provider === '' ? `规格 : ${i.seriesName}<br />
                    Image: ${i.seriesName}<br />
                    Bandwidth: ${i.seriesName}<br />
                    RunMode: ${i.seriesName}<br />` : ''}`
}

export function isRepeat(arr: any, num: any) {
    // return arr.toString().match(new RegExp( num , 'g')).length > 1
    let sum = 0
    for (let x = 0, len = arr.length; x < len; x++) {
        if (arr[x] === num) {
            sum++
            if (sum > 1) return true
        }
    }
    return false
}

export const colors = [
    "rgb(216, 124, 124)",
    "rgb(145, 158, 139)",
    "rgb(215, 171, 130)",
    "rgb(110, 112, 116)",
    "rgb(97, 160, 168)",
    "rgb(239, 161, 141)",
    "rgb(120, 116, 100)",
    "rgb(204, 126, 99)",
    "rgb(114, 78, 88)",
    "rgb(75, 86, 91)",
    "rgb(221, 107, 102)",
    "rgb(117, 154, 160)",
    "rgb(230, 157, 135)",
    "rgb(141, 193, 169)",
    "rgb(234, 126, 83)",
    "rgb(238, 221, 120)",
    "rgb(115, 163, 115)",
    "rgb(115, 185, 188)",
    "rgb(114, 137, 171)",
    "rgb(145, 202, 140)",
    "rgb(244, 159, 66)",
    "rgb(81, 107, 145)",
    "rgb(89, 196, 230)",
    "rgb(237, 175, 218)",
    "rgb(147, 183, 227)",
    "rgb(165, 231, 240)",
    "rgb(203, 176, 227)",
    "rgb(137, 52, 72)",
    "rgb(217, 88, 80)",
    "rgb(235, 129, 70)",
    "rgb(255, 178, 72)",
    "rgb(242, 214, 67)",
    "rgb(235, 219, 164)",
    "rgb(78, 163, 151)",
    "rgb(34, 195, 170)",
    "rgb(123, 217, 165)",
    "rgb(208, 100, 138)",
    "rgb(245, 141, 178)",
    "rgb(242, 179, 201)",
    "rgb(63, 177, 227)",
    "rgb(107, 230, 193)",
    "rgb(98, 108, 145)",
    "rgb(160, 167, 230)",
    "rgb(196, 235, 173)",
    "rgb(150, 222, 232)",
    "rgb(252, 151, 175)",
    "rgb(135, 247, 207)",
    "rgb(247, 244, 148)",
    "rgb(114, 204, 255)",
    "rgb(247, 197, 160)",
    "rgb(212, 164, 235)",
    "rgb(210, 245, 166)",
    "rgb(118, 242, 242)",
    "rgb(193, 35, 43)",
    "rgb(39, 114, 123)",
    "rgb(252, 206, 16)",
    "rgb(232, 124, 37)",
    "rgb(181, 195, 52)",
    "rgb(254, 132, 99)",
    "rgb(155, 202, 99)",
    "rgb(250, 216, 96)",
    "rgb(243, 164, 59)",
    "rgb(96, 192, 221)",
    "rgb(215, 80, 75)",
    "rgb(198, 229, 121)",
    "rgb(244, 224, 1)",
    "rgb(240, 128, 90)",
    "rgb(38, 192, 192)",
    "rgb(46, 199, 201)",
    "rgb(182, 162, 222)",
    "rgb(90, 177, 239)",
    "rgb(255, 185, 128)",
    "rgb(216, 122, 128)",
    "rgb(141, 152, 179)",
    "rgb(229, 207, 13)",
    "rgb(151, 181, 82)",
    "rgb(149, 112, 109)",
    "rgb(220, 105, 170)",
    "rgb(7, 162, 164)",
    "rgb(154, 127, 209)",
    "rgb(88, 141, 213)",
    "rgb(245, 153, 78)",
    "rgb(192, 80, 80)",
    "rgb(89, 103, 140)",
    "rgb(201, 171, 0)",
    "rgb(126, 176, 10)",
    "rgb(111, 85, 83)",
    "rgb(193, 64, 137)",
    "rgb(224, 31, 84)",
    "rgb(0, 24, 82)",
    "rgb(245, 232, 200)",
    "rgb(184, 210, 199)",
    "rgb(198, 179, 142)",
    "rgb(164, 216, 194)",
    "rgb(243, 217, 153)",
    "rgb(211, 117, 143)",
    "rgb(220, 195, 146)",
    "rgb(46, 71, 131)",
    "rgb(130, 182, 233)",
    "rgb(255, 99, 71)",
    "rgb(160, 146, 241)",
    "rgb(10, 145, 93)",
    "rgb(234, 248, 137)",
    "rgb(102, 153, 255)",
    "rgb(255, 102, 102)",
    "rgb(60, 179, 113)",
    "rgb(213, 177, 88)",
    "rgb(56, 182, 182)",
    "rgb(193, 46, 52)",
    "rgb(230, 182, 0)",
    "rgb(0, 152, 217)",
    "rgb(43, 130, 29)",
    "rgb(0, 94, 170)",
    "rgb(51, 156, 168)",
    "rgb(205, 168, 25)",
    "rgb(50, 164, 135)",
    "rgb(138, 124, 168)",
    "rgb(224, 152, 199)",
    "rgb(143, 211, 232)",
    "rgb(113, 102, 158)",
    "rgb(204, 112, 175)",
    "rgb(124, 180, 204)"
]