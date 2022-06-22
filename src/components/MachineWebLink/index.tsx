import { requestCodeMessage } from '@/utils/utils'
import { querySeverLink } from '@/pages/WorkSpace/TestResult/Details/service'


export const handleIpHerf = async (ip: string, type: string) => {
    if (type === '云上机器') {
        const { data, code, msg } = await querySeverLink({ ip })
        if (code === 200) {
            const win: any = window.open("");
            setTimeout(function () { win.location.href = data.link })
        }
        requestCodeMessage(code, msg)
    } else {
        // return
        // 内网机器IP/SN跳转terminal处理方法 勿删除
        const href = getTerminalLink(ip)
        const win: any = window.open("");
        setTimeout(function () { win.location.href = href })
    }
}
// 内网机器IP/SN跳转terminal处理方法 勿删除
export const getTerminalLink = (link: string) => {
    const src = "https://sa.alibaba-inc.com/ops/terminal.html?&source=tone&"
    const ipRgx = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/

    if (link) {
        if (ipRgx.test(link)) return src + `ip=${link}`
        return src + `sn=${link}`
    }
    return link
}