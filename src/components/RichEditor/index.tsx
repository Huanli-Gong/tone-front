import { EditorContent, useEditor, ReactNodeViewRenderer } from '@tiptap/react'
import type { EditorOptions } from '@tiptap/react'
import React from 'react'
import MenuBar from './MenuBar'
import { EditorCls } from "./styled"

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

import { lowlight } from 'lowlight'

type IProps = Partial<EditorOptions> & { placeholder?: string }

const RichEditor: React.FC<IProps> = (props) => {
    const { content, placeholder, editable = true } = props

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
                }).configure({
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
            Image.configure({
                inline: true,
                allowBase64: true,
            })
        ],
        ...props
    }, [content])

    return (
        <EditorCls editable={editable}>
            {
                editable &&
                <MenuBar editor={editor} />
            }
            {
                editor &&
                <EditorContent
                    editor={editor}
                    style={{ height: `calc(100%${editable ? " - 48px" : ""})` }}
                />
            }
        </EditorCls>
    )
}

export default RichEditor