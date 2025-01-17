import styled from 'styled-components';

export const MenuItem = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    padding-left: 6px;
    padding-right: 6px;
    color: #333;
    cursor: pointer;
    white-space: nowrap;
    border-radius: 4px;

    &:hover {
        background-color: #f1f1f1;
    }

    svg {
        width: 15px;
        height: 15px;
    }

    &.is-active,
    &.disabled {
        background-color: #f1f1f1;
    }
`;

export const ToolBar = styled.div`
    border-top: 1px solid #e5e5e5;
    border-left: 1px solid #e5e5e5;
    border-right: 1px solid #e5e5e5;
    border-radius: 4px 4px 0 0;
    display: flex;
    align-items: center;
    height: 48px;
    padding: 0 8px;
`;

export const ToolMenu = styled(MenuItem)`
    position: relative;
`;

export const DropdownWrapper = `
    box-shadow: 0 8px 16px 4px rgb(0 0 0 / 4%);
    border: 1px solid #FFFFFF;
    border-radius: 8px;
    list-style: none;
    margin: 0;
    background-color: #FFFFFF;
    padding: 0;
    position: absolute;
    z-index: 100;
    overflow: hidden;
    bottom: 0;
    right: 0;
    transform: translateY(100%);
`;

export const ToolMenuList = styled.ul`
    ${DropdownWrapper}
`;

export const ToolMenuItem = styled.li`
    position: relative;
    padding: 4px 15px 4px 8px;
    font-size: 12px;
    background-color: #fff;
    font-weight: bold;
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;

    &:hover {
        background-color: #eff0f0;
        border-radius: 4px;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        margin: 0;
    }
`;

export const ToolMenuItemActive = styled.span`
    display: inline-flex;
    width: 16px;
    height: 100%;
    align-items: center;
`;

export const ToolMenuWrapper = styled.div`
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 8px;
    cursor: pointer;
`;

export const ToolbarWidget = styled.span`
    display: inline-block;
    height: 16px;
    width: 1px;
    background-color: #e5e5e5;
    margin-left: 6px;
    margin-right: 6px;
`;

export const EditorCls = styled.div<{ editable?: boolean, styledCss?: string }>`
    width: 100%;
    height: 100%;
    h1 {
        font-size: 28px !important;
    }
    h2 {
        font-size: 24px !important;
    }
    h3 {
        font-size: 20px !important;
    }
    h4 {
        font-size: 16px !important;
    }
    h5 {
        font-size: 13px !important;
    }
    h6 {
        font-size: 12px !important;
    }

    .ProseMirror {
        table {
            border-collapse: collapse;
            margin: 0;
            overflow: hidden;
            table-layout: fixed;
            width: 100%;

            td,
            th {
                border: 1px solid #e5e5e5;
                box-sizing: border-box;
                min-width: 1em;
                padding: 3px 5px;
                position: relative;
                vertical-align: top;

                > * {
                    margin-bottom: 0;
                }
            }

            th {
                background-color: #e5e5e5;
                font-weight: bold;
                text-align: left;
            }

            .selectedCell:after {
                background: rgba(27, 162, 227, 0.2);
                content: '';
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                pointer-events: none;
                position: absolute;
                z-index: 2;
            }

            .column-resize-handle {
                background-color: #1890ff;
                bottom: -2px;
                position: absolute;
                right: -2px;
                pointer-events: none;
                top: 0;
                width: 4px;
            }

            p {
                margin: 0;
            }
        }
    }

    .tableWrapper {
        padding: 8px 0;
        overflow-x: auto;
    }

    .resize-cursor {
        cursor: ew-resize;
        cursor: col-resize;
    }

    .ProseMirror {
        width: 100%;
        height: 100%;
        overflow: auto;
        border-radius: 0 0 4px 4px;
        ${({ editable }) => (editable ? 'border: 1px solid #e5e5e5;' : '')}
        padding: 8px;
        height: 100%;
        > * + * {
            margin-top: 0.75em;
        }
        &:focus-visible {
            outline: none;
        }
        a span {
            color: #1890ff !important;
        }
        ul,
        ol {
            padding: 0 1rem;
        }

        ul {
            list-style: disc;
            ul {
                list-style: circle;
            }
        }
        ol {
            list-style: auto;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            line-height: 1.1;
        }

        code {
            background-color: rgba(97, 97, 97, 0.1);
            color: #616161;
        }

        .code-block {
            position: relative;

            .lang-selecter {
                position: absolute;
                width: 100px;
                right: 0.5rem;
                top: 0.5rem;
                max-height: 10rem;
            }

            .copy-outline {
                width: 16px;
                height: 16px;
                cursor: pointer;
                position: absolute;
                right: 0.5rem;
                top: 0.5rem;
                svg {
                    width: 100%;
                    height: 100%;
                }
            }
        }
        pre {
            background: #0d0d0d;
            border-radius: 0.5rem;
            color: #fff;
            font-family: 'JetBrainsMono', monospace;
            padding: 0.75rem 1rem;

            code {
                background: none;
                color: inherit;
                font-size: 0.8rem;
                padding: 0;
            }

            .hljs-comment,
            .hljs-quote {
                color: #616161;
            }

            .hljs-variable,
            .hljs-template-variable,
            .hljs-attribute,
            .hljs-tag,
            .hljs-name,
            .hljs-regexp,
            .hljs-link,
            .hljs-name,
            .hljs-selector-id,
            .hljs-selector-class {
                color: #f98181;
            }

            .hljs-number,
            .hljs-meta,
            .hljs-built_in,
            .hljs-builtin-name,
            .hljs-literal,
            .hljs-type,
            .hljs-params {
                color: #fbbc88;
            }

            .hljs-punctuation {
                color: #fff !important;
            }

            .hljs-attr {
                color: #9cdcfe !important;
            }

            .hljs-string,
            .hljs-symbol,
            .hljs-bullet {
                color: #b9f18d;
            }

            .hljs-title,
            .hljs-section {
                color: #faf594;
            }

            .hljs-keyword,
            .hljs-selector-tag {
                color: #70cff8;
            }

            .hljs-emphasis {
                font-style: italic;
            }

            .hljs-strong {
                font-weight: 700;
            }
        }

        img {
            max-width: 640px;
            height: auto;
        }

        blockquote {
            padding-left: 1rem;
            border-left: 4px solid rgba(208, 208, 208, 0.9);
        }

        hr {
            border-top: 2px solid rgba(208, 208, 208, 1);
            margin: 2rem 0;
        }

        p.is-editor-empty:first-child::before {
            color: #adb5bd;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
        }
    }

    .ProseMirror-hideselection *::selection {
        background-color: #1890ff;
    }

    .tiptap-image-resize-container {
        position: relative;

        .inline-block {
            display: inline-block;
        }

        .text-center {
            text-align: center;
        }

        .img-resize-title-container {
            display: inline-flex;
            flex-direction: column;
            gap: 4px;
        }

        .input-image-title {
            border: none;
            outline: none;
            color: #8a8f8d;

            &:focus {
                outline: none;
                box-shadow: none;
            }
        }

        .ne-image-title-content {
            vertical-align: top;
            min-width: 1px;
            max-width: 100%;
            min-height: 18px;
            line-height: 22px;
            font-size: 14px;
            outline: none;
            word-break: break-word;
            white-space: normal;
            color: #8a8f8d;
            text-align: center;
            caret-color: auto;
        }

        .tiptap-image-resize-wrapper {
            position: relative;
            display: inline-block;

            .postimage {
                display: inline-block;
                border-radius: 8px;
                max-width: 100%;
            }

            .tiptap-resize-left-handle,
            .tiptap-resize-right-handle,
            .tiptap-resize-top-handle,
            .tiptap-resize-bottom-handle {
                position: absolute;
                opacity: 0;
                width: 8px;
                height: 30px;
                transition: opacity 0.3s ease;
                background-color: #000;
                border: 1px solid #fff;
                border-radius: 4px;
            }

            .tiptap-resize-top-handle,
            .tiptap-resize-bottom-handle {
                cursor: ns-resize;
                left: 50%;
                transform: translateX(-50%);
                height: 8px;
                width: 30px;
            }

            .tiptap-resize-left-handle,
            .tiptap-resize-right-handle {
                top: 50%;
                transform: translateY(-50%);
                cursor: ew-resize;
            }

            .tiptap-resize-top-handle {
                top: 0px;
            }

            .tiptap-resize-bottom-handle {
                bottom: 0px;
            }

            .tiptap-resize-left-handle {
                left: 0px;
            }

            .tiptap-resize-right-handle {
                right: 0px;
            }

            &:hover {
                ${({ editable }) =>
                    editable && 'outline: rgb(100, 160, 255) solid 4px; border-radius: 8px;'}

                .tiptap-resize-left-handle,
                .tiptap-resize-right-handle,
                .tiptap-resize-top-handle,
                .tiptap-resize-bottom-handle {
                    opacity: 1;
                }
            }
        }

        .image-title {
            color: #a1a1a1;
            border-bottom: 1px solid #e2e2e2;
        }
    }

    ${({ styledCss }) => styledCss};
`;

export const ImageResizeBubble = styled.div`
    position: absolute;
    left: 0;
    top: -34px;
    display: flex;
    gap: 8px;
    background: #333;
    color: #fff;
    padding: 6px;
    // padding-bottom: 20px;
    border-radius: 8px;
    z-index: 999;
    .image-resize-bubble-span {
        display: flex;
        overflow: hidden;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s ease, opacity 0.1s ease;
        width: 20px;
        height: 20px;
        font-size: 16px;
        color: #fff;
        cursor: pointer;
        svg {
            fill: #fff;
        }
    }
`
