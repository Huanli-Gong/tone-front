import { EditorContent, useEditor, ReactNodeViewRenderer } from '@tiptap/react';
import type { EditorOptions } from '@tiptap/react';
import React from 'react';
import MenuBar from './MenuBar';
import { EditorCls } from './styled';

import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import FontSize from 'tiptap-extension-font-size';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import CodeBlockComponent from './components/CodeBlockComponent';

import { SmilieReplacer } from './components/Emoji/emojiReplacer';
import { lowlight } from 'lowlight';
import ImageResize from './components/ImageResize';

type IProps = Partial<EditorOptions> & { placeholder?: string; contentStyle?: React.CSSProperties; styledCss?: string; }

const RichEditor: React.FC<IProps> = (props) => {
    const { content, placeholder, editable = true , contentStyle, styledCss = ''} = props;
    const regex = /<p>\s*(<img [^>]*\/?>)\s*(<br\s*\/?>)?\s*<\/p>/gi;
    const editor = useEditor(
        {
            extensions: [
                StarterKit,
                Underline,
                TextStyle,
                Color,
                FontFamily,
                FontSize,
                Table.configure({ resizable: true }),
                TableRow,
                TableHeader,
                TableCell,
                Subscript,
                Superscript,
                CodeBlockLowlight.extend({
                    addNodeView() {
                        return ReactNodeViewRenderer(CodeBlockComponent);
                    },
                }).configure({
                    lowlight,
                    defaultLanguage: 'plaintext',
                }),
                Highlight.configure({ multicolor: true }),
                Placeholder.configure({ placeholder }),
                Link.configure({ openOnClick: false }),
                TextAlign.configure({ types: ['heading', 'paragraph'] }),
                ImageResize.configure({
                    allowBase64: true,
                }),
                SmilieReplacer,
            ],
            ...props,
            content: (content as any)?.replace(
                regex,
                (match: any, imgTag: any, brTag: any) => (imgTag || '') + (brTag || ''),
            ),
        },
        [content],
    );

    return (
        <EditorCls editable={editable}
         styledCss={styledCss}>
            {editable && <MenuBar editor={editor} />}
            {editor && (
                <EditorContent
                    editor={editor}
                    style={{ height: `calc(100%${editable ? " - 48px" : ""})`, ...contentStyle }}
                />
            )}
        </EditorCls>
    );
};

export default React.memo(RichEditor);
