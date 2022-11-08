import React from "react"
import { HomeContainer, TSpace } from "./styled"
import { queryHelpDocList } from '../HelpDocument/services'
import HomeBanner from "./components/Banner"
import TopWorkspaces from "./components/TopWorkspace"
import NoticeBlock from "./components/NoticeBlock"
import WorkspaceTabs from "./TabTable.tsx"

const AnolisHome: React.FC<Record<string, any>> = () => {
    const [docs, setDocs] = React.useState({ "notice": [], "help_doc": [] })
    const [loading, setLoading] = React.useState(true)

    const fetcher = async () => {
        setLoading(true)
        const { data, code } = await queryHelpDocList()
        if (code !== 200) return
        const ft = data.filter(({ active }: any) => active)
            .sort((a: any, b: any) => a.order_id - b.order_id)
            .reduce((pre: any, cur: any) => {
                const { doc_type } = cur
                if (pre[doc_type])
                    pre[doc_type].push(cur)
                else
                    pre[doc_type] = [cur]
                return pre
            }, {})
        const rt = ["notice", "help_doc"].reduce((pre, cur) => {
            pre[cur] = ft[cur]
            return pre
        }, {})
        setDocs(rt as any)
        setLoading(false)
    }

    React.useEffect(() => {
        fetcher()
    }, [])

    return (
        <HomeContainer>
            <TSpace gap={20} direction="column">
                <HomeBanner />
                <TSpace gap={20}>
                    <TopWorkspaces />
                    <TSpace direction="column" gap={20} >
                        {
                            Object.entries(docs).map((item => {
                                const [$type, list]: any = item

                                return (
                                    <NoticeBlock
                                        loading={loading}
                                        key={$type}
                                        firstTagColor={$type === "help_doc" ? "#108ee9" : '#FF4D4D'}
                                        title={$type}
                                        path={`/${$type}`}
                                        list={(list || []).slice(0, $type === "help_doc" ? 5 : 2)}
                                    />
                                )
                            }))
                        }
                    </TSpace>
                </TSpace>
                <WorkspaceTabs />
            </TSpace>
        </HomeContainer>
    )
}

export default AnolisHome