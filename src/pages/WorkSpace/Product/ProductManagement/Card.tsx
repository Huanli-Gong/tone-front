import React, { useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Typography, Tooltip } from 'antd';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { ReactComponent as Statistical } from '@/assets/svg/dashboard/statistical.svg'
import { ReactComponent as NoStatistical } from '@/assets/svg/dashboard/noStatistical.svg'
import styles from './index.less'

const ItemTypes = {
  CARD: 'card',
}

const Card = ({
  data,
  index,
  moveCard,
  handleProjecIcon,
  hanldeProjectDetail
}: any) => {
  const { id, name, product_version, is_default, is_show, description } = data
  const ref: any = useRef(null)
  
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: any, monitor: any) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex)
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const opacity = isDragging ? 0 : 1
  drag(drop(ref))
  return (
    <>
      <div ref={ref} style={{ opacity }} data-handler-id={handlerId} className={styles.project_warpper}>
        <div className={is_default ? styles.project_default_icon : styles.project_icon} onClick={() => handleProjecIcon(id)} />
        <div className={styles.project_child} onClick={() => hanldeProjectDetail(data)}>
          <EllipsisPulic title={name}>
            <Typography.Text className={styles.project_name}>{name}</Typography.Text>
            <div style={{ height: 6 }}></div>
          </EllipsisPulic>
          <EllipsisPulic title={product_version}>
            <Typography.Text className={styles.project_version}>
              {is_show ?
                <Tooltip placement="bottomLeft" title='项目会统计在Dashboard'>
                  <Statistical style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
                </Tooltip> :
                <Tooltip placement="bottomLeft" title='项目不会统计在Dashboard'>
                  <NoStatistical style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
                </Tooltip>
              }
              {product_version}
            </Typography.Text>
            <div style={{ height: 2 }}></div>
          </EllipsisPulic>
          <EllipsisPulic title={description}>
            <Typography.Text className={styles.project_version}>{description}</Typography.Text>
            <div style={{ height: 2 }}></div>
          </EllipsisPulic>
        </div>
      </div>
      
    </>

  )
}
export default Card;