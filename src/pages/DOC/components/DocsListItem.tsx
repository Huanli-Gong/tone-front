import React, { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import styled from 'styled-components'
import { HolderOutlined, MoreOutlined } from '@ant-design/icons'
import { Badge, Tag, Dropdown, Menu, message, Typography, MenuProps } from 'antd'
import classnames from 'classnames'
import { useParams, useAccess, Access, history } from 'umi'
import { deleteDoc } from '../services'

const DragDeleteIcon = styled.div`
    width: 30px;
    height: 100%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    visibility: hidden;
`

const DragIcon = styled.div`
    width: 16px;
    height: 100%;
    display: flex;
    cursor: pointer;
    background-color: rgba(0,0,0,.04);
    align-items: center;
    justify-content: center;
    visibility: hidden;
`

const DrageIconFallback = styled.div`
    width: 16px;
    height: 100%;
`

const DrageText = styled(Typography.Text)`

`

const ListItem = styled.div`
    width: 100%;
    height: 36px;
    cursor: pointer;
    display: flex;
    flex-direction:row;

    &.drop-over-downward {
        border-bottom: 2px dashed #1890ff;
    } 
    &.drop-over-upward {
        border-top: 2px dashed #1890ff;
    }

    &.can-drap:hover {
        background-color : rgb(248, 249, 250);
        ${DragIcon} {
            visibility: visible;
        }
    }

    &:hover {
        background-color: rgb(248, 249, 250);
        ${DragDeleteIcon} {
            visibility: visible;
        }
    }

    &.doc_active {
        background-color: rgb(248,249,250);
        ${DrageText} {
            color :#1890ff;
        }
    }
`

const DrageWrapper = styled.div`
    width: calc(100% - 30px);
    height: 100%;
    display: flex;
    align-items: center;
`

const DragTitle = styled.div`
    width: calc(100% - 16px);
    padding: 0 8px;
    .ant-typography {
        width: calc(100% - 14px - 38px - 16px);
    }
`

const type = 'DragableBodyRow'

type IProps = {
    [k: string]: any
}

const tagsWords = (t: string) => new Map([
    ['mustRead', '必看'],
    ['course', '教程'],
    ['docs', '文档'],
    ['maintain', '维护'],
    ['notice', '通知'],
    ['upgrade', '升级'],
    ['stop', '暂停'],
    ['mustRead', '必看'],
]).get(t)

const switchColor = (t: string, i: number) => {
    if (t === 'help')
        if (i === 0) return '#108ee9'
    if (i === 0) return '#FF4D4D'
    return 'rgba(0,0,0,.04)'
}

const DocListItem: React.FC<IProps> = (props) => {
    const { index, onMove, title, active, id, tags, disable, className, refresh, ...rest } = props

    const { doc_type, doc_id } = useParams() as any
    const access = useAccess()
    const ref = useRef();

    const [{ isOver, dropClassName }, drop] = useDrop({
        accept: type,
        collect: monitor => {
            const { index: dragIndex }: any = monitor.getItem() || {};
            if (dragIndex === index)
                return {};
            return {
                isOver: monitor.isOver(),
                dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
            };
        },
        drop: (item: any) => {
            onMove(item.index, index)
        },
        canDrop: () => !disable && index !== 0,
    });

    const [, drag] = useDrag({
        type,
        item: { index },
        canDrag: () => !disable && index !== 0,
        collect: monitor => {
            return {
                isDragging: monitor.isDragging(),
            }
        },
    });

    drop(drag(ref));

    const handleDeleteDoc = async ({ id }: any) => {
        const { code, msg } = await deleteDoc({ id })
        if (code !== 200) {
            message.warning(msg)
            return
        }
        if (id === +doc_id)
            history.push(`/${doc_type}`)
        refresh()
    }

    const handleClickMenu: MenuProps["onClick"] = ({ key }) => {
        if (key === "delete") {
            handleDeleteDoc(props)
        }
    }

    return (
        <ListItem
            ref={ref as any}
            {...rest}
            className={
                classnames(
                    className,
                    index === 0 ? 'can-not-drap' : 'can-drap',
                    isOver && dropClassName,
                )
            }
        >
            <DrageWrapper>
                <Access
                    accessible={access.IsSysTestAdmin()}
                    fallback={
                        <DrageIconFallback />
                    }
                >
                    <DragIcon>
                        <HolderOutlined />
                    </DragIcon>
                </Access>
                <DragTitle >
                    <Badge style={{ marginRight: 6 }} status={active ? 'success' : 'error'} />
                    <Tag
                        color={switchColor(doc_type, index)}
                        style={{ border: 'transparent', color: index === 0 ? '#fff' : 'rgba(0,0,0,.65)' }}
                    >
                        {tagsWords(tags)}
                    </Tag>
                    <DrageText ellipsis>
                        {title}
                    </DrageText>
                </DragTitle>
            </DrageWrapper>
            <Access accessible={access.IsSysTestAdmin()} >
                <Dropdown
                    trigger={["click"]}
                    overlay={
                        <>
                            {/* @ts-ignore */}
                            <Menu
                                onClick={handleClickMenu}
                                items={[{
                                    key: "delete",
                                    label: "删除"
                                }]}
                            />
                        </>
                    }
                >
                    <DragDeleteIcon>
                        <MoreOutlined />
                    </DragDeleteIcon>
                </Dropdown>
            </Access>
        </ListItem>
    )
}

export default DocListItem