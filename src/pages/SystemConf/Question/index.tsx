import { Tabs } from "antd"
import React from "react"
import Knowledge from "./Knowledge"
import Feedback from "./Feadback"
import { history, useLocation } from "umi"
import styled from "styled-components"

const TabsCls = styled(Tabs)`
    .ant-tabs-nav-list {
        padding-left: 20px;
    }

    .ant-tabs-content {
        padding: 0 20px;
    }
`

const SysQuestion: React.FC = () => {
    const { query, pathname } = useLocation() as any
    const [activeKey, setActiveKey] = React.useState(query?.tab || 'knowledge')

    return (
        <div>
            <TabsCls
                activeKey={activeKey}
                onTabClick={(tab) => {
                    setActiveKey(tab)
                    history.replace(pathname + `?tab=${tab}`)
                }}
                items={[{
                    key: 'knowledge',
                    label: '知识库',
                    children: <Knowledge />
                }, {
                    key: 'question',
                    label: '问题收集',
                    children: <Feedback />
                }]}
            />
        </div>
    )
}

export default SysQuestion