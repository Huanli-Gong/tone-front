import React, { useState, useRef, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { Row, Button, Input, message } from 'antd'
import type { FormInstance } from 'antd/lib/form'
import { useParams, history, useAccess, Helmet } from 'umi';
import DocLayout from '../components/DocLayout';
import { createDoc, queryDocList, updateDoc } from '../services'
import Setting from './components/Setting';
import Outline from './components/Outline';
import { ArrowLeftOutlined } from '@ant-design/icons'
import Loading from '../components/Loading';
import RichEditor from '@/components/RichEditor';
import type { Editor } from '@tiptap/core';
import { replaceEmoji, tarnsformEmoji } from '@/components/RichEditor/components/Emoji/emojiReplacer';

const Content = styled.div`
    width: 100%;
    height: calc(100% - 50px - 10px);
`

const Editer = styled.div`
    width: 850px;
    margin: 10px auto;
    height: 100%;
    background-color: #ffffff;
    box-shadow: 0 2px 10px rgb(0 0 0 / 12%);
    padding: 20px;
    /* overflow: auto; */
`

const TitleWrapper = styled.div`
    padding: 0 0 20px 0;
    /* border-bottom: 1px solid #e8e8e8; */
    input {
        outline: none;
        border:0 !important;
        box-shadow: unset!important;
        font-size: 30px;
        width: 100%;
        line-height: 1;
    }
`

const EditerWrapper = styled.div`
    width: 100%;
    height: calc(100% - 64px );
`

const ToolBarWrapper = styled(Row)`
    background-color: #fff;
    height: 50px;
    padding:0 20px;
`

const CreateDoc: React.FC = () => {
    const { doc_type, doc_id } = useParams() as any
    const access = useAccess()

    const [title, setTtitle] = useState('')
    const [loading, setLoading] = useState(true)
    const [text, setText] = React.useState("")
    const [vm, setVm] = React.useState<Editor>()
    const [json, setJson] = React.useState<any>()

    const setting = useRef<FormInstance | undefined>()
    const ele = useRef() as any
    const editWrapper = useRef() as any

    const getDoc = async () => {
        setLoading(true)
        if (doc_id) {
            const { code, data } = await queryDocList({ id: doc_id })
            if (code === 200) {
                if (!!data.length && JSON.stringify(data[0]) !== '{}') {
                    const { active } = data[0]
                    setting.current?.setFieldsValue({ ...data[0], active: active ? 1 : 0 })
                    return data[0]
                }
                return {}
            }
        }
        return false
    }

    const initEditor = (data: any) => {
        const { title, content } = data
        title && setTtitle(title)
        content && setText(tarnsformEmoji(content))
    }

    const init = async () => {
        if (!access.IsSysTestAdmin()) return history.push('/')
        const data = await getDoc()
        setLoading(false)
        initEditor(data)
    }

    useEffect(() => {
        init()
    }, [doc_id])

    React.useEffect(() => {
        return () => {
            setVm(undefined)
        }
    }, [])

    const handleTitleChange = ({ target }: any) => setTtitle(target?.value || '')

    const handleBack = () => {
        history.push(`/${doc_type}${doc_id ? '/' + doc_id : ''}`)
    }

    const handlePublish = async () => {
        const html = replaceEmoji(vm?.getHTML())
        if (!html) return message.warning("内容不能为空！")
        if (!title) return message.warning('标题不能为空！')
        const form = setting.current

        form?.validateFields()
            .then(async (values) => {
                const param: any = {
                    title,
                    content: html,
                    doc_type,
                    ...values,
                }
                const { code, msg, data } = !doc_id ?
                    await createDoc(param) :
                    await updateDoc({ ...param, id: doc_id })
                if (code !== 200) {
                    message.error(msg)
                    return
                }

                const $id = doc_id ? `/${doc_id}` : `/${data.id}`
                const isEdit = `/${doc_type}${$id}`
                history.push(isEdit)
            })
            .catch(error => {
                console.log(error)
            })
    }

    const headerTitle = useMemo(() => {
        return `${doc_id ? '编辑' : '新建'}${doc_type === 'notice' ? '公告' : '帮助文档'} — T-One`
    }, [title, doc_id])

    return (
        <DocLayout>
            <Helmet>
                <title>{headerTitle}</title>
            </Helmet>
            <Content>
                <ToolBarWrapper justify="space-between" align="middle">
                    <span
                        style={{ cursor: 'pointer' }}
                        onClick={handleBack}
                    >
                        <ArrowLeftOutlined style={{ fontSize: 20 }} />
                    </span>
                    <Button type="primary" onClick={handlePublish}>
                        {
                            doc_id ? "更新" : "发布"
                        }
                    </Button>
                </ToolBarWrapper>

                <Editer ref={editWrapper}>
                    <TitleWrapper>
                        <Input
                            value={title}
                            placeholder="请输入标题"
                            autoComplete="off"
                            onChange={handleTitleChange}
                        />
                    </TitleWrapper>
                    <EditerWrapper ref={ele} >
                        <RichEditor
                            content={text}
                            placeholder="说点什么？"
                            onCreate={({ editor }) => {
                                setVm(editor)
                                setJson(editor.getJSON())
                            }}
                            onUpdate={({ editor }) => {
                                setVm(editor)
                                setJson(editor.getJSON())
                            }}
                        />
                    </EditerWrapper>
                </Editer>

                <Setting ref={setting} />

                <Outline json={json} />
            </Content>

            <Loading loading={loading} />
        </DocLayout>
    )
}

export default CreateDoc