import React from "react"
import { BaseTitle, TSpace } from "../styled"
import styled from "styled-components"
import { queryWorkspaceTopList } from '@/services/Workspace'
import WorkspaceBlock from "./WorkspaceBlock"
import { useIntl } from "umi"
import { Empty, Row, Spin } from "antd"

const WokspacesContainer = styled.div`
    /* display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px; */
    width: 100%;
    height: 100%;
`

const TopWorkspaces: React.FC = () => {
    const intl = useIntl()

    const [loading, setLoading] = React.useState(true)
    const [workspaces, setWorkspaces] = React.useState([])

    const fetcher = async () => {
        setLoading(true)
        try {
            const { data, code } = await queryWorkspaceTopList()
            setWorkspaces(code !== 200 ? [] : data || [])
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetcher()
    }, [])

    return (
        <TSpace
            direction="column"
            gap={12}
            style={{
                width: "calc(100% - 310px - 10px)",
                background: "#fff",
                borderRadius: 2,
                padding: 10,
            }}
        >
            <BaseTitle>
                {intl.formatMessage({ id: `pages.home.recommend.Workspace` })}
            </BaseTitle>
            <WokspacesContainer >
                <Row style={{ gap: 10 }}>
                    {
                        workspaces.map((ws: any) => (
                            <WorkspaceBlock
                                width={`calc((100% - 40px) / 5)`}
                                key={ws.id}
                                {...ws}
                            />
                        ))
                    }
                </Row>
                {
                    !workspaces.length &&
                    <Row justify="center" align="middle" style={{ width: "100%", height: 300 }}>
                        {
                            loading ?
                                <Spin /> :
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        }
                    </Row>
                }
            </WokspacesContainer>
        </TSpace>
    )
}

export default TopWorkspaces