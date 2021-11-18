import { useDrag, useDrop } from 'react-dnd';
import React, { useRef } from 'react';
import styled from 'styled-components'
import classNames from 'classnames';

const DrageTr = styled.tr`
    &.drop-over-downward td {
        border-bottom: 2px dashed #1890ff;
    }
    &.drop-over-upward td {
        border-top: 2px dashed #1890ff;
    }

    &.disableCursor {
        cursor:default!important;

        .drageIcon {
            visibility: hidden;
        }
    }

    &.drop-over-downward.disableCursor td {
        border-bottom: 2px dashed #ff4d4f!important;
        cursor:disable!important;
    }

    &.drop-over-upward.disableCursor td {
        border-top: 2px dashed #ff4d4f!important;
        cursor:disable!important;
    }

    &.dropTalbeRow{
        :hover {
            .dragIconWrapper {
                background: rgba(0,0,0,.04)!important;
                padding:0!important;
            }
            .drageIcon{
                visibility:visible;
            }
        }
    }

    &.gary-bg {
        background:rgba(0,0,0,.02);
    }

    & .drageIcon {
        visibility: hidden;
    }
`

const type = 'DragableBodyRow';

type IProps = {
    [key: string]: any
}

const DragableBodyRow = (props: IProps) => {
    const { index, onMove, disable, is_show, className, style, ...restProps } = props
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
        drop: (item: any) => onMove(item.index, index),
        canDrop: () => !disable,
    });

    const [, drag] = useDrag({
        type,
        item: { index },
        canDrag: () => !disable,
        collect: monitor => {
            return {
                isDragging: monitor.isDragging(),
            }
        },
    });

    drop(drag(ref));

    return (
        <DrageTr
            ref={ref as any}
            className={
                classNames(
                    className,
                    !disable && 'dropTalbeRow',
                    isOver && dropClassName,
                    disable && 'disableCursor',
                    is_show && 'gary-bg'
                )
            }
            style={{ cursor: 'move', ...style }}
            {...restProps}
        />
    );
};

export default DragableBodyRow

/**
 *
 * @param props
 * @returns
 * ```ts
 * DndProvider
 *
 *
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';

 const components = {
     body: {
         row: DragableBodyRow,
     },
 };

 const moveRow = useCallback(
     (dragIndex, hoverIndex) => {
         console.log(dragIndex, hoverIndex)
         const dragRow = dataSource[dragIndex];
         setDataSource(update(dataSource, {
             $splice: [
                 [dragIndex, 1],
                 [hoverIndex, 0, dragRow],
             ],
         }));
     },
     [dataSource],
 );

 components={components}
 onRow={(record, index) => ({
     index,
     moveRow,
 })}
 * ```
 */