import AvatarCover from "@/components/AvatarCover"
import { Avatar, Space, Tooltip, Typography } from "antd"
import React from "react"
import { useModel, history, useIntl, useAccess } from "umi"

import styled from "styled-components"
import { useSize } from "ahooks"
import { jumpWorkspace, OPENANOLIS_LOGIN_URL } from '@/utils/utils'

const Container = styled.div`
    height: 96px;
    /* width: 242px; */
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
    const { show_name, owner_name, avatar, description, is_public, id, width, is_member } = props

    const intl = useIntl()
    const access = useAccess()
    const { initialState } = useModel("@@initialState")
    const { user_id, } = initialState?.authList || {}

    const ref = React.useRef(null)
    const size = useSize(ref)
    const [open, setOpen] = React.useState(false)

    const handleEnterWs = async () => {
        if (!is_public) {
            if (!user_id) {
                if (BUILD_APP_ENV === 'openanolis') {
                    return window.location.href = OPENANOLIS_LOGIN_URL
                }
                return history.push(`/login?redirect_url=${jumpWorkspace(id)}`)
            }
            if (!is_member) return
        }

        history.push(jumpWorkspace(id))
    }

    const handleMouseEnter = () => {
        if (!access.IsAdmin() && !is_public && !is_member)
            setOpen(true)
    }

    const handleMouseLeave = () => {
        setOpen(false)
    }

    return (
        <div
            style={{ width }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Tooltip
                placement="bottom"
                title={intl.formatMessage({ id: `pages.anolis_home.no_pub_tooltip_title` })}
                overlayInnerStyle={{ color: "red" }}
                overlayStyle={{ padding: 4 }}
                color="#fff"
                open={open}
            >
                <Container
                    onClick={handleEnterWs}
                    ref={ref}
                >
                    <div>
                        <Space size={0}>
                            <AvatarCover
                                size={42}
                                style={{
                                    borderRadius: 6,
                                    fontSize: 24,
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
                                style={{ width: `calc(${size?.width}px - 42px - 10px - 24px)` }}
                            >
                                {
                                    size?.width &&
                                    <Typography.Text
                                        style={{
                                            fontWeight: 500,
                                            fontSize: 16,
                                            color: "rgba(0,0,0,0.85)",
                                            width: size?.width - 42 - 10 - 24
                                        }}
                                        ellipsis={{ tooltip: true }}
                                    >
                                        {show_name}
                                    </Typography.Text>
                                }
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
            </Tooltip>
        </div>
    )
}

export default WorkspaceBlock