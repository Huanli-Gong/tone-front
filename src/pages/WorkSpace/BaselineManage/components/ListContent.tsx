import React from "react"
import styled from "styled-components"
import { ReactComponent as BaselineSvg } from '@/assets/svg/baseline.svg'
import { Typography, Popconfirm } from "antd"
import { Access, useAccess, useIntl, useParams, history } from "umi"
import { MinusCircleOutlined, ExclamationCircleOutlined, CopyOutlined } from "@ant-design/icons"
import { AccessTootip, randomStrings } from '@/utils/utils';
import { deleteBaseline, postBaselineCopy } from '../services'
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
    const access = useAccess()

    const [fetching, setFetching] = React.useState<boolean>(false)

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

    const handleBaselineCopy = async (item: any) => {
        const { name: baseline_name, id: baseline_id } = item
        if (fetching) return
        setFetching(true)
        const { code, msg } = await postBaselineCopy({ baseline_name: `${baseline_name}-${randomStrings()}`, baseline_id })
        setFetching(false)
        if (code !== 200) {
            console.log(msg)
            return
        }
        refresh?.(page_num)
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
                                <Popconfirm
                                    title={intl.formatMessage({ id: 'operation.confirm.copy.title' }, { data: <Typography.Text strong>{item.name}</Typography.Text> })}
                                    onConfirm={() => handleBaselineCopy(item)}
                                    okText={intl.formatMessage({ id: "operation.confirm.copy" })}
                                    cancelText={intl.formatMessage({ id: "operation.cancel" })}
                                    overlayInnerStyle={{ maxWidth: 320 }}
                                >
                                    <CopyOutlined style={{ cursor: 'pointer' }} />
                                </Popconfirm>
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
                                    <MinusCircleOutlined style={{ color: "red", cursor: 'pointer' }} />
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