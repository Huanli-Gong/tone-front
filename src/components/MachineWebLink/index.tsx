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
        return
        // const href = getTerminalLink(ip)
        // const win: any = window.open("");
        // setTimeout(function () { win.location.href = href })
    }
}