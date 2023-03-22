import AvatarCover from "@/components/AvatarCover"
import { Avatar, Button, Space, Typography, Tooltip } from "antd"
// import { Tooltip } from "react-tooltip"
import React from "react"
import styled from "styled-components"
import { history, useModel, useIntl, useAccess } from "umi"
import ApplyJoinWorkspace from '@/components/ApplyJoinPopover'

import { ReactComponent as PublicIcon } from '@/assets/svg/public.svg'
import { ReactComponent as NPublicIcon } from '@/assets/svg/no_public.svg'
import { jumpWorkspace, OPENANOLIS_LOGIN_URL } from '@/utils/utils'
// import 'react-tooltip/dist/react-tooltip.css'

const TableCellColumn = styled.div`
    background-color: #FFFFFF;
    box-shadow: 0 1px 5px 0 rgba(0,0,0,0.15);
    border-radius: 2px;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 48px;
    width: 100%;
    padding: 0 20px;
    cursor: pointer;
    &:hover {
        box-shadow: 0 3px 20px 0 rgba(0,0,0,0.20);
        z-index: 20;
    }
`

const intrWidth = "255px"
const ownerWidth = "156px"
const OperateWidth = "120px"

const Intr = styled.div`
    height: 100%;
    width: ${intrWidth};
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
`

const Owner = styled.div`
    width: ${ownerWidth};
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
`

const Operations = styled.div`
    width: ${OperateWidth};
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: end;
    .ant-btn {
        /* display: none; */
        margin: 0 !important;
    }
`

const Desc = styled(Typography.Text)`
    width: calc(100% - ${intrWidth} - ${ownerWidth} - ${OperateWidth});
`

export const TableRow: React.FC<Record<string, any>> = (props) => {
    const { show_name, is_public, description, avatar, owner_name, id, is_member } = props

    const access = useAccess()
    const intl = useIntl()
    const { initialState } = useModel("@@initialState")
    const { user_id } = initialState?.authList || {}

    const ref = React.useRef<any>(null)
    const [open, setOpen] = React.useState(false)

    const handleJumpWs = async () => {
        history.push(jumpWorkspace(id))
    }

    const renderOperationButton = () => {
        /* 公开ws 未登录跳登录 */
        //私密ws 未登录跳转登录
        /* 未登录，私密不显示按钮 */
        if (access.IsAdmin() || is_member || is_public)
            return (
                <Button onClick={handleJumpWs}>
                    {intl.formatMessage({ id: `pages.anolis_home.button.enter` })}
                </Button>
            )

        if (!is_public) {
            if (!user_id) return <></>
            if (BUILD_APP_ENV === "openanolis" && !is_member) return <></>
        }

        return (
            <ApplyJoinWorkspace
                onRef={ref}
                ws_id={id}
                btnText={intl.formatMessage({ id: `pages.anolis_home.button.join` })}
                btnType="default"
            />
        )
    }

    const handleClick = () => {
        if (access.IsAdmin() || is_member || is_public) return handleJumpWs()
        if (!user_id && !is_public) {
            if (BUILD_APP_ENV === 'openanolis') {
                return window.location.href = OPENANOLIS_LOGIN_URL
            }
            return history.push(`/login?redirect_url=${jumpWorkspace(id)}`)
        }
        return ref.current?.show()
    }

    const handleMouseEnter = () => {
        if (!access.IsAdmin() && !is_public && !is_member)
            setOpen(true)
    }

    const handleMouseLeave = () => {
        setOpen(false)
    }

    return (
        <TableCellColumn
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Intr >
                <AvatarCover {...props} size={32} />
                <Space size={4}>
                    <Typography.Text
                        ellipsis={{ tooltip: true }}
                        style={{ maxWidth: "calc(255px - 12px - 32px - 20px - 8px)" }}
                    >
                        {show_name}
                    </Typography.Text>

                    <Tooltip
                        open={open}
                        color={"#fff"}
                        overlayClassName={"tooltip_no_pub"}
                        overlayStyle={{ paddingTop: 4, }}
                        arrowPointAtCenter
                        overlayInnerStyle={{ color: "red", fontSize: 12, padding: 4, minHeight: 0 }}
                        title={intl.formatMessage({ id: `pages.anolis_home.no_pub_tooltip_title` })}
                        placement={"bottom"}
                    >
                        <div>
                            {

                                is_public ?
                                    <PublicIcon /> :
                                    <NPublicIcon id={id} />
                            }
                        </div>
                    </Tooltip>
                </Space>
            </Intr>

            <Owner >
                <Avatar src={avatar} size={25} />
                <Typography.Text ellipsis={{ tooltip: true }}>{owner_name}</Typography.Text>
            </Owner>

            <Desc ellipsis={{ tooltip: true }}>{description}</Desc>

            <Operations>
                {
                    renderOperationButton()
                }
            </Operations>

        </TableCellColumn>
    )
}


const HeaderRow = styled.div`
    width: 100%;
    padding: 0 20px;
    display: flex;
    flex-direction: row;

    ${Intr},
    ${Owner},
    ${Desc} {
        font-weight: 400;
        font-size: 12px;
        color: rgba(0,0,0,.45);
    }
`

export const TableHeader: React.FC = () => {
    const intl = useIntl()
    return (
        <HeaderRow>
            <Intr >
                {intl.formatMessage({ id: `pages.anolis_home.column.ws_name` })}
            </Intr>
            <Owner >
                {intl.formatMessage({ id: `pages.anolis_home.column.ws_owner` })}
            </Owner>
            <Desc >
                {intl.formatMessage({ id: `pages.anolis_home.column.ws_desc` })}
            </Desc>
        </HeaderRow>
    )
}