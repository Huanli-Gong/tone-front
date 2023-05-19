import { FormattedMessage } from 'umi'
import { PlusOutlined } from '@ant-design/icons';
import Card from './Card';
import styles from './index.less';

const style = {
  display: 'flex',
  gap: 10,
  flexFlow: 'wrap',
  width: '100%'
}
const Container = (props: any) => {
  const {
    dataSource,
    clickType,
    callBackFormTo,
    hanldCreateProject,
    handleProjecIcon,
    hanldeProjectDetail,
  } = props

  const moveCard = (dragIndex: any, hoverIndex: any) => {
    callBackFormTo(dragIndex, hoverIndex, dataSource)
  }
  const renderCard = (item: any, index: any) => {
    return (
      <Card
        data={item}
        key={item.id}
        index={index}
        moveCard={moveCard}
        handleProjecIcon={handleProjecIcon}
        hanldeProjectDetail={hanldeProjectDetail}
      />
    )
  }

  return (
    <div style={style}>
      {dataSource.map((item: any, i: number) => renderCard(item, i))}
      {clickType === 'menu' && (
        <div className={styles.project_create} onClick={hanldCreateProject}>
          <div className={styles.project_create_empty}>
            <PlusOutlined style={{ marginRight: 6 }} />
            <FormattedMessage id="product.create.project" />
          </div>
        </div>
      )
      }
    </div>
  )
}
export default Container;