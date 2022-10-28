import AvatarCover from "@/components/AvatarCover"
import { Avatar, Space, Typography } from "antd"
import React from "react"
import { useModel, history } from "umi"

import styled from "styled-components"
import { getEnterWorkspaceState } from "../TabTable.tsx/TableColumns"

const Container = styled.div`
    height: 96px;
    width: 242px;
    background-color: #FFFFFF;
    box-shadow: 0 1px 5px 0 rgba(0,0,0,0.15);
    border-radius: 4px;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 12px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: pointer;

    &:hover {
        box-shadow: 0 3px 20px 0 rgba(0,0,0,0.20);
    }
`

const WorkspaceBlock: React.FC<Record<string, any>> = (props) => {
    const { show_name, owner_name, avatar, description } = props

    const { initialState } = useModel("@@initialState")
    const { user_id } = initialState?.authList || {}

    const handleEnterWs = async () => {
        const path = await getEnterWorkspaceState(props, user_id)
        path && history.push({ pathname: path, state: { fetchWorkspaceHistoryRecord: true } })
    }

    return (
        <Container
            onClick={handleEnterWs}
        >
            <div>
                <Space size={0}>
                    <AvatarCover
                        size={42}
                        style={{
                            borderRadius: 6,
                            fontSize: 40,
                            width: 42,
                            height: 42,
                            lineHeight: '42px',
                            display: 'inline-block',
                            marginRight: 10
                        }}
                        {...props}
                    />
                    <Space
                        direction="vertical"
                        size={0}
                        style={{ width: "calc(242px - 42px - 10px - 24px)" }}
                    >
                        <Typography.Text
                            style={{
                                fontWeight: 500,
                                fontSize: 16,
                                color: "rgba(0,0,0,0.85)",
                                width: "100%"
                            }}
                            ellipsis={{ tooltip: true }}
                        >
                            {show_name}
                        </Typography.Text>
                        <Space size={4}>
                            <Avatar size={16} src={avatar} />
                            <Typography.Text
                                style={{
                                    fontWeight: 400,
                                    fontSize: 12,
                                    color: "rgba(0,0,0,0.50)",
                                }}
                            >
                                {owner_name}
                            </Typography.Text>
                        </Space>
                    </Space>
                </Space>
            </div>
            <Typography.Text ellipsis={{ tooltip: true }}>
                {description}
            </Typography.Text>
        </Container >
    )
}

export default WorkspaceBlock