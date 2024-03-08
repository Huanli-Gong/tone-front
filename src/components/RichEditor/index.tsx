import { EditorContent, useEditor, ReactNodeViewRenderer } from '@tiptap/react'
import type { EditorOptions } from '@tiptap/react'
import React, { useRef, useState } from 'react'
import MenuBar from './MenuBar'
import { EditorCls } from "./styled"
import { Image as ImagePreview } from 'antd'

import StarterKit from '@tiptap/starter-kit'
import Underline from "@tiptap/extension-underline"
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import FontFamily from '@tiptap/extension-font-family'
import FontSize from 'tiptap-extension-font-size'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import CodeBlockComponent from './components/CodeBlockComponent'

import { SmilieReplacer } from "./components/Emoji/emojiReplacer"
import { lowlight } from 'lowlight'

type IProps = Partial<EditorOptions> & { placeholder?: string; contentStyle?: React.CSSProperties; styledCss?: string; }

const RichEditor: React.FC<IProps> = (props) => {
    const { content, placeholder, editable = true, contentStyle, styledCss = '' } = props

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            FontFamily,
            FontSize,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Subscript,
            Superscript,
            CodeBlockLowlight
                .extend({
                    addNodeView() {
                        return ReactNodeViewRenderer(CodeBlockComponent)
                    },
                })
                .configure({
                    lowlight,
                    defaultLanguage: 'plaintext',
                }),
            Highlight.configure({ multicolor: true }),
            Placeholder.configure({
                placeholder,
            }),
            Link.configure({
                openOnClick: false,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image
                .configure({
                    inline: true,
                    allowBase64: true,
                    HTMLAttributes: {
                        class: 'tiptap-image-cls',
                    },
                }),
            SmilieReplacer,
        ],
        ...props,
    }, [content])

    const ref = useRef<HTMLDivElement>(null)
    const [preview, setPreview] = useState({ src: undefined, visible: false })

    const handlePreview = (event: Event) => {
        if (editor?.isEditable) return
        const targetDom = event.target as any
        if (!!~targetDom.className.indexOf('tiptap-image-cls')) {
            setPreview({ src: targetDom.getAttribute('src'), visible: true })
        }
    }

    React.useEffect(() => {
        ref.current?.addEventListener('click', handlePreview)
        return () => {
            ref.current?.removeEventListener('click', handlePreview)
        }
    }, [])

    return (
        <EditorCls
            editable={editable}
            ref={ref}
            styledCss={styledCss}
        >
            {
                editable &&
                <MenuBar editor={editor} />
            }
            {
                editor &&
                <EditorContent
                    editor={editor}
                    style={{ height: `calc(100%${editable ? " - 48px" : ""})`, ...contentStyle }}
                />
            }
            {
                (!editor?.isEditable && preview?.src) &&
                <ImagePreview
                    style={{ display: 'none' }}
                    src={preview?.src}
                    preview={{
                        visible: preview?.visible,
                        onVisibleChange: (visible) => {
                            setPreview({ src: undefined, visible })
                        }
                    }}
                />
            }
        </EditorCls>
    )
}

export default React.memo(RichEditor)