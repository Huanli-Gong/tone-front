import React from "react"
import { FullSpace, HomeContainer, VerticalSpace } from "./styled"
import { queryHelpDocList } from '../HelpDocument/services'
import HomeBanner from "./components/Banner"
import TopWorkspaces from "./components/TopWorkspace"
import NoticeBlock from "./components/NoticeBlock"
import WorkspaceTabs from "./TabTable.tsx"

const AnolisHome: React.FC<Record<string, any>> = () => {
    const [docs, setDocs] = React.useState({ "notice": [], "help_doc": [] })

    const fetcher = async () => {
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
    }

    React.useEffect(() => {
        fetcher()
    }, [])

    return (
        <HomeContainer>
            <VerticalSpace size={20}>
                <HomeBanner />
                <FullSpace size={20}>
                    <TopWorkspaces />
                    <FullSpace direction="vertical" size={20} >
                        {
                            Object.entries(docs).map((item => {
                                const [$type, list]: any = item

                                return (
                                    <NoticeBlock
                                        key={$type}
                                        firstTagColor={$type === "help_doc" ? "#108ee9" : '#FF4D4D'}
                                        title={$type}
                                        path={`/${$type}`}
                                        list={(list || []).slice(0, $type === "help_doc" ? 5 : 2)}
                                    />
                                )
                            }))
                        }
                    </FullSpace>
                </FullSpace>
                <WorkspaceTabs />
            </VerticalSpace>
        </HomeContainer>
    )
}

export default AnolisHome