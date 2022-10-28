import React from "react"
import { BaseTitle, Whiteboard } from "../styled"
import styled from "styled-components"
import { queryWorkspaceTopList } from '@/services/Workspace'
import WorkspaceBlock from "./WorkspaceBlock"
import { useIntl } from "umi"
import { Empty, Row } from "antd"

const WokspacesContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
    width: 1044px;
`

const TopWorkspaces: React.FC = () => {
    const intl = useIntl()

    const [workspaces, setWorkspaces] = React.useState([])

    const fetcher = async () => {
        const { data, code } = await queryWorkspaceTopList()
        setWorkspaces(code !== 200 ? [] : data || [])
    }

    React.useEffect(() => {
        fetcher()
    }, [])

    return (
        <Whiteboard direction="vertical" style={{ width: 1044, height: 388 }}>
            <BaseTitle>
                {intl.formatMessage({ id: `pages.home.recommend.Workspace` })}
            </BaseTitle>
            <WokspacesContainer>
                {
                    workspaces.map((ws: any) => <WorkspaceBlock key={ws.id} {...ws} />)
                }

                {
                    !workspaces.length &&
                    <Row justify="center" align="middle" style={{ width: "100%", height: "100%" }}>
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </Row>
                }
            </WokspacesContainer>
        </Whiteboard>
    )
}

export default TopWorkspaces