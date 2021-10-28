export function textTip ( title : string, data : any ) {
    return data ? `${ title }：${ data }<br />` : ''
}

export function commitLinkTip ( title : string , { commit , job_id , ws_id } : any ) {
    return commit ? `${ title }: <a href="/ws/${ ws_id }/test_result/${ job_id }">${commit }</a><br />` : ''
}

export function serverLinkTip ( ip : any ) {
    return ip ?
    `测试机器: <a target="_blank" href="https://sa.alibaba-inc.com/ops/terminal.html?&source=tone&ip=${ip}">${ip}</a><br />` :
    ''
}

export const renderProviderText = (i: any , provider : string ) => {
    return `${provider === '' ? `规格 : ${i.seriesName}<br />
                    Image: ${i.seriesName}<br />
                    Bandwidth: ${i.seriesName}<br />
                    RunMode: ${i.seriesName}<br />` : ''}`
}