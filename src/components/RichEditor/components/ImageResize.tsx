import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Image as ImagePreview, Input } from 'antd';
import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import cls from 'classnames';
import { ReactComponent as TextLeft } from '../assets/text-left.svg';
import { ReactComponent as TextRight } from '../assets/text-right.svg';
import { ReactComponent as TextCenter } from '../assets/text-center.svg';
import { ReactComponent as ImageTitle } from '../assets/image-title.svg';
import { ImageResizeBubble } from '../styled';
import { useClickAway } from 'ahooks';
import { createPortal } from 'react-dom';

export const inputRegex = /(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

const RESIZE_CONTAINER_CLASS = 'tiptap-image-resize-container';

const iconMap = (n: string) =>
    new Map([
        ['title', <ImageTitle />],
        ['left', <TextLeft />],
        ['center', <TextCenter />],
        ['right', <TextRight />],
    ]).get(n);

const ResizeBubble: React.FC<any> = (props) => {
    const { setOpenTitle, updateAttributes, parent } = props;
    return (
        <ImageResizeBubble
            className="image-resize-bubble"
            style={{
                left: parent.getBoundingClientRect()?.left,
                top: parent.getBoundingClientRect()?.top - 40,
            }}
        >
            {['title', 'left', 'center', 'right'].map((n: any) => (
                <span
                    key={n}
                    className="image-resize-bubble-span"
                    onClick={() =>
                        n === 'title'
                            ? setOpenTitle(true)
                            : updateAttributes({
                                  align: n,
                              })
                    }
                >
                    {iconMap(n)}
                </span>
            ))}
        </ImageResizeBubble>
    );
};

const ImageResizeComponent = (props: any) => {
    const { editor, node, updateAttributes } = props;
    if (!editor) return;
    const [preview, setPreview] = React.useState({ src: undefined, visible: false });
    const [open, setOpen] = React.useState(false);
    const [openTitle, setOpenTitle] = React.useState(false);
    const [title, setTitle] = React.useState(node.attrs.title);

    const ref = React.useRef<any>();
    const dom = React.useRef<any>();
    const img = React.useRef<any>();

    useClickAway(() => {
        setOpen(false);
    }, dom);

    const handlePreview = (event: any) => {
        if (editor?.isEditable) return;
        const targetDom = event.target as any;
        if (!!~targetDom.className.indexOf('postimage')) {
            setPreview({ src: targetDom.getAttribute('src'), visible: true });
        }
    };

    const handler = (evt: React.MouseEvent<HTMLDivElement>) => {
        const parent = (evt.target as HTMLElement).closest(`.${RESIZE_CONTAINER_CLASS}`);
        const placement = (evt.target as HTMLElement).getAttribute('data-attr');
        const image = parent?.querySelector('img.postimage') ?? null;
        if (image === null) return;
        const startSize = { x: image.clientWidth, y: image.clientHeight };
        const startPosition = { x: evt.pageX, y: evt.pageY };

        function onMouseMove(mouseMoveEvent: MouseEvent) {
            if (placement === 'right' || placement === 'left') {
                const width =
                    placement === 'right'
                        ? startSize.x - startPosition.x + mouseMoveEvent.pageX
                        : startSize.x + startPosition.x - mouseMoveEvent.pageX;

                updateAttributes({
                    'data-width': width > 20 ? width : 20,
                    style: {
                        ...node.attrs.style,
                        width: width > 20 ? width : 20,
                    },
                });
            }

            if (placement === 'top' || placement === 'bottom') {
                const height =
                    placement === 'top'
                        ? startSize.y + startPosition.y - mouseMoveEvent.pageY
                        : startSize.y - startPosition.y + mouseMoveEvent.pageY;

                updateAttributes({
                    'data-height': height > 20 ? height : 20,
                    style: {
                        ...node.attrs.style,
                        height: height > 20 ? height : 20,
                    },
                });
            }
        }

        function onMouseUp() {
            window.removeEventListener('mousemove', onMouseMove);
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp, { once: true });
    };

    const handleLoad = (evt: any) => {
        const ele = evt.target;
        const $width = ele.getAttribute('data-width');
        const { height, width } = ref.current.getBoundingClientRect();
        const $height = ele.getAttribute('data-height');
        if ($width && $height) {
            updateAttributes({
                style: {
                    width: $width + 'px',
                    height: $height + 'px',
                },
            });

            return;
        }

        updateAttributes({
            'data-width': width,
            'data-height': height,
            style: {
                width: width + 'px',
                height: height + 'px',
            },
        });
    };

    const handleTitleEnterOk = () => {
        updateAttributes({
            title,
        });
        setOpenTitle(false);
    };

    return (
        <NodeViewWrapper
            className={cls(RESIZE_CONTAINER_CLASS)}
            ref={ref}
            style={{ textAlign: node.attrs.align }}
        >
            <div className="img-resize-title-container" ref={dom}>
                <div
                    className={cls('tiptap-image-resize-wrapper')}
                    title={node.attrs.title}
                    onClick={() => setOpen(true)}
                >
                    <img
                        {...node.attrs}
                        className="postimage"
                        onClick={handlePreview}
                        onLoad={handleLoad}
                        data-drag-handle
                        ref={img}
                    />
                    {editor?.isEditable && (
                        <>
                            <div
                                data-attr="left"
                                className="tiptap-resize-left-handle"
                                onMouseDown={handler}
                            />
                            <div
                                data-attr="right"
                                className="tiptap-resize-right-handle"
                                onMouseDown={handler}
                            />
                            <div
                                data-attr="top"
                                className="tiptap-resize-top-handle"
                                onMouseDown={handler}
                            />
                            <div
                                data-attr="bottom"
                                className="tiptap-resize-bottom-handle"
                                onMouseDown={handler}
                            />
                            {open &&
                                createPortal(
                                    <ResizeBubble
                                        {...props}
                                        setOpenTitle={setOpenTitle}
                                        parent={dom.current}
                                    />,
                                    document.body,
                                )}
                        </>
                    )}
                </div>
                <div className="text-center ne-image-title-content">
                    {openTitle ? (
                        <Input
                            size="small"
                            className="text-center input-image-title"
                            placeholder="请输入图片描述"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onPressEnter={handleTitleEnterOk}
                            onBlur={handleTitleEnterOk}
                        />
                    ) : (
                        <div onClick={() => setOpenTitle(true)}>{node.attrs.title}</div>
                    )}
                </div>
            </div>

            {!editor?.isEditable && (
                <ImagePreview
                    style={{ display: 'none' }}
                    src={preview?.src}
                    preview={{
                        visible: preview?.visible,
                        onVisibleChange: (visible) => {
                            setPreview({ src: undefined, visible });
                        },
                    }}
                />
            )}
        </NodeViewWrapper>
    );
};

export default Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            style: {
                default: {},
                renderHTML: (attributes) => {
                    return {
                        // style: attributes.style,
                    };
                },
            },
            'data-width': {
                renderHTML: (attributes) => {
                    return {
                        'data-width': attributes['data-width'],
                    };
                },
            },
            'data-height': {
                renderHTML: (attributes) => {
                    return {
                        'data-height': attributes['data-height'],
                    };
                },
            },
            align: {
                renderHTML: (attributes) => {
                    return {
                        align: attributes.align,
                    };
                },
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageResizeComponent);
    },
});
