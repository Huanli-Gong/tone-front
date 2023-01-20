import React from "react"
import data from "./data"

import { ToolMenu, ToolMenuList } from "../../styled"

import { ReactComponent as EmojiOutlined } from "../../assets/emoji.svg"
import { TooltipMenu } from "../TooltipMenu"
import type { Editor } from "@tiptap/react"
import { useClickAway } from "ahooks"

import styled from "styled-components"

type EmojiClassItemProps = {
    is_active: boolean
}

const BaseTabStyle = `
    background-color: #1890ff;
    color: #fff;
`

const EmojiClassItem = styled.div <EmojiClassItemProps>`
    display: flex;
    div {
        padding: 0 6px;
        border-radius: 4px;
        display: flex;
        flex-direction: row;
        font-weight: 500;
        gap: 6px;
        ${({ is_active }) => is_active && BaseTabStyle}
        &:hover {
            ${BaseTabStyle}
        }
    }
    &::after {
        content: '';
        border-right: 1px solid #e5e5e5;
        height: 100%;
        margin-left: 8px;
    }
`

const EmojiClassRow = styled.div`
    display: flex;
    flex-direction: row;
    gap: 8px;
    border-bottom: 1px solid #e5e5e5;
    padding-bottom: 8px;
    margin-bottom: 8px;
    overflow: auto;

    ${EmojiClassItem} {
        &:last-child::after {
            display: none;
        }
    }
`

const EmojiItemWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    max-height: 248px;
    overflow: auto;
    svg {
        width: 24px !important;
        height: 24px !important;
    }
`

const EmojiShowSpan = styled.span`
    font-size: 24px;
`

const Emoji: React.FC<{ editor: Editor }> = ({ editor }) => {
    const [emojiIndex, setEmojiIndex] = React.useState(0)
    const [show, setShow] = React.useState(false)
    const ref = React.useRef<HTMLDivElement>(null)

    useClickAway(() => {
        setShow(false)
    }, ref)

    if (!editor) return <></>

    return (
        <ToolMenu
            ref={ref}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <TooltipMenu
                title="表情"
            >
                <EmojiOutlined />
            </TooltipMenu>
            {
                show &&
                <ToolMenuList style={{ right: 0, left: "unset", padding: 8, maxWidth: 320 }} >
                    <EmojiClassRow>
                        {
                            data.map((item: any, index: number) => (
                                <EmojiClassItem
                                    key={item.title}
                                    onClick={() => setEmojiIndex(index)}
                                    is_active={emojiIndex === index}
                                >
                                    <div>
                                        <span>{item.line_emoji}</span>
                                        <span>{item.title.replace(item.line_emoji, "")}</span>
                                    </div>
                                </EmojiClassItem>
                            ))
                        }
                    </EmojiClassRow>
                    <EmojiItemWrapper>
                        {
                            data[emojiIndex].list.map((i: any) => (
                                <TooltipMenu
                                    title={i.name}
                                    key={i.keyword}
                                    onClick={() => {
                                        editor.commands.insertContent(i.emoji)
                                        setShow(false)
                                    }}
                                >
                                    <EmojiShowSpan>{i.emoji}</EmojiShowSpan>
                                </TooltipMenu>
                            ))
                        }
                    </EmojiItemWrapper>
                </ToolMenuList>
            }
        </ToolMenu>
    )
}

export default Emoji