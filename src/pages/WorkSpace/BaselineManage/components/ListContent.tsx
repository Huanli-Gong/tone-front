import React from "react"
import styled from "styled-components"
import { ReactComponent as BaselineSvg } from '@/assets/svg/baseline.svg'
import { Typography, Popconfirm } from "antd"
import { Access, useAccess, useIntl, useParams, history } from "umi"
import { MinusCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons"
import { AccessTootip } from '@/utils/utils';
import { deleteBaseline } from '../services'
import cls from "classnames"

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
    gap: 4px;

    &.is-active-baseline {
        ${activeCss};
    }

    .anticon.anticon-minus-circle {
        visibility: hidden;
        width: 14px;
    }
    
    &:hover {
        ${activeCss};
        .anticon.anticon-minus-circle {
            visibility: visible;
        }
    }
`

const Title = styled(Typography.Text)`
    width: calc(100% - 16px - 14px);
`

type IProps = Workspace.BaselineListQuery & {
    refresh?: () => void;
    current?: Workspace.BaselineItem;
    setCurrent?: (val?: Workspace.BaselineItem) => void;
    test_type?: string;
}

const ListContent: React.FC<IProps> = (props) => {
    const { data, refresh, current, setCurrent, test_type } = props
    const { ws_id } = useParams() as any
    const intl = useIntl()
    const access = useAccess()

    const handleDelete = async (item: any) => {
        const { code } = await deleteBaseline({ baseline_id: item.id, ws_id })
        if (code !== 200)
            return

        refresh?.()
    }

    const handleClick = (item?: Workspace.BaselineItem) => {
        setCurrent?.(item)
        history.replace(`/ws/${ws_id}/baseline/${test_type}?baseline_id=${item?.id}`)
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
                                accessible={access.WsMemberOperateSelf()}
                                fallback={
                                    <MinusCircleOutlined onClick={() => AccessTootip()} />
                                }
                            >
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
                                    <MinusCircleOutlined style={{ color: "red" }} />
                                </Popconfirm>
                            </Access>
                        </ListItem>
                    )
                })
            }
        </ListContentCls >
    )
}

export default ListContent