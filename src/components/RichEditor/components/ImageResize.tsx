import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Image as ImagePreview } from 'antd';
import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import cls from 'classnames';
import { ReactComponent as TextLeft } from '../assets/text-left.svg';
import { ReactComponent as TextRight } from '../assets/text-right.svg';
import { ReactComponent as TextCenter } from '../assets/text-center.svg';
import { ImageResizeBubble } from '../styled';
import { useClickAway } from 'ahooks';

export const inputRegex = /(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

const RESIZE_CONTAINER_CLASS = 'tiptap-image-resize-container';

const ImageResizeComponent = (props: any) => {
    const { editor, node } = props;
    if (!editor) return;
    const [preview, setPreview] = React.useState({ src: undefined, visible: false });
    const [open, setOpen] = React.useState(false);

    const ref = React.useRef<any>();
    const dom = React.useRef<any>();

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
                props.updateAttributes({
                    'data-width': width,
                    style: {
                        ...node.attrs.style,
                        width,
                    },
                });
            }

            if (placement === 'top' || placement === 'bottom') {
                const height =
                    placement === 'top'
                        ? startSize.y + startPosition.y - mouseMoveEvent.pageY
                        : startSize.y - startPosition.y + mouseMoveEvent.pageY;
                props.updateAttributes({
                    'data-height': height,
                    style: {
                        ...node.attrs.style,
                        height,
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
        const $height = ele.getAttribute('data-height');
        if ($width && $height) {
            props.updateAttributes({
                style: {
                    width: $width + 'px',
                    height: $height + 'px',
                },
            });

            return;
        }

        const { height, width } = ele.getBoundingClientRect();
        props.updateAttributes({
            'data-width': width,
            'data-height': height,
            style: {
                width: width + 'px',
                height: height + 'px',
            },
        });
    };

    return (
        <NodeViewWrapper
            className={cls(RESIZE_CONTAINER_CLASS)}
            ref={ref}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            style={{ textAlign: node.attrs.align }}
        >
            <div className="tiptap-image-resize-wrapper" ref={dom}>
                <img
                    {...props.node.attrs}
                    className="postimage"
                    onClick={handlePreview}
                    onLoad={handleLoad}
                    data-drag-handle
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
                        {editor?.isEditable && open && (
                            <ImageResizeBubble className="image-resize-bubble">
                                <span
                                    className="image-resize-bubble-span"
                                    onClick={() =>
                                        props.updateAttributes({
                                            align: 'left',
                                        })
                                    }
                                >
                                    <TextLeft />
                                </span>
                                <span
                                    className="image-resize-bubble-span"
                                    onClick={() =>
                                        props.updateAttributes({
                                            align: 'center',
                                        })
                                    }
                                >
                                    <TextCenter />
                                </span>
                                <span
                                    className="image-resize-bubble-span"
                                    onClick={() =>
                                        props.updateAttributes({
                                            align: 'right',
                                        })
                                    }
                                >
                                    <TextRight />
                                </span>
                            </ImageResizeBubble>
                        )}
                    </>
                )}
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
