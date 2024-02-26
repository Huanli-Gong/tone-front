import React from "react"
import styled from "styled-components"
import { ReactComponent as BaselineSvg } from '@/assets/svg/baseline.svg'
import { Typography, Popconfirm, Tooltip } from "antd"
import { Access, useAccess, useIntl, useParams, history } from "umi"
import { MinusCircleOutlined, ExclamationCircleOutlined, CopyOutlined } from "@ant-design/icons"
import { AccessTootip } from '@/utils/utils';
import { deleteBaseline } from '../services'
import cls from "classnames"
import CopyBaselineModal from "./CopyBaselineModal"

const ListContentCls = styled.div`
    width: 100%;
    height: calc(100% - 32px - 72px - 32px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding: 8px 0;
`

const activeCss = `
    background: #fafafa;
    .ant-typography {
        color: #1890ff;
    }
    .baseline-item-icon {
        path,
        polygon {
            fill: #1890ff;
        }
    }
`

const ListItem = styled.div`
    height: 24px;
    display: flex;
    padding-left: 20px;
    padding-right: 10px;
    align-items: center;
    cursor: pointer;
    gap: 8px;

    &.is-active-baseline {
        ${activeCss};
    }

    .anticon.anticon-minus-circle,
    .anticon.anticon-copy {
        visibility: hidden;
        width: 14px;
    }
    
    &:hover {
        ${activeCss};
        .anticon.anticon-minus-circle,
        .anticon.anticon-copy {
            visibility: visible;
        }
    }
`

const Title = styled(Typography.Text)`
    width: calc(100% - 16px - 14px);
`

type IProps = Workspace.BaselineListQuery & {
    refresh?: (page_num: any) => void;
    current?: Workspace.BaselineItem;
    setCurrent?: (val?: Workspace.BaselineItem) => void;
    test_type?: string;
}

const ListContent: React.FC<IProps> = (props) => {
    const { data, refresh, current, setCurrent, test_type, page_size = 20, page_num, total = 0 } = props
    const { ws_id } = useParams() as any
    const intl = useIntl()
    const access = useAccess() as any
    const copyNameModalRef = React.useRef() as any

    const handleDelete = async (item: any) => {
        const { code } = await deleteBaseline({ baseline_id: item.id, ws_id })
        if (code !== 200)
            return

        const remainNum = total % page_size === 1
        const totalPage: number = Math.floor(total / page_size)
        /* @ts-ignore */
        refresh?.((remainNum && totalPage && totalPage + 1 <= page_num) ? totalPage : undefined)
    }

    const handleClick = (item?: Workspace.BaselineItem) => {
        setCurrent?.({})
        setTimeout(() => {
            setCurrent?.(item)
            history.replace(`/ws/${ws_id}/baseline/${test_type}?baseline_id=${item?.id}`)
        }, 10)
    }

    return (
        <ListContentCls>
            {
                data?.map((item: Workspace.BaselineItem) => {
                    return (
                        <ListItem
                            key={item?.id}
                            onClick={() => handleClick(item)}
                            className={cls(current?.id === item?.id && "is-active-baseline")}
                        >
                            <BaselineSvg className="baseline-item-icon" />
                            <Title
                                ellipsis={{ tooltip: true }}
                            >
                                {item?.name || "-"}
                            </Title>
                            <Access
                                accessible={access.WsMemberOperateSelf(item?.creator)}
                                fallback={<MinusCircleOutlined onClick={() => AccessTootip()} />}
                            >
                                <Tooltip
                                    title={
                                        intl.formatMessage({ id: 'baseline.modal.copy.title' })
                                    }
                                    placement="top"
                                >
                                    <CopyOutlined style={{ cursor: 'pointer' }} onClick={() => copyNameModalRef.current.show(item)} />
                                </Tooltip>

                                <Popconfirm
                                    title={
                                        <Typography.Text type="danger">
                                            {intl.formatMessage({ id: "baseline.delete.prompt1" })}
                                            {intl.formatMessage({ id: "baseline.delete.prompt2" })}
                                        </Typography.Text>
                                    }
                                    onCancel={() => handleDelete(item)}
                                    cancelText={intl.formatMessage({ id: "operation.confirm.delete" })}
                                    cancelButtonProps={{ disabled: !!item?.is_first }}
                                    okText={intl.formatMessage({ id: "operation.cancel" })}
                                    icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
                                >
                                    <Tooltip
                                        title={
                                            intl.formatMessage({ id: 'operation.delete' })
                                        }
                                        placement="top"
                                    >
                                        <MinusCircleOutlined style={{ color: "red", cursor: 'pointer' }} />
                                    </Tooltip>
                                </Popconfirm>
                            </Access>
                        </ListItem>
                    )
                })
            }

            <CopyBaselineModal ref={copyNameModalRef} onOk={() => refresh?.(page_num)} />
        </ListContentCls >
    )
}

export default ListContent