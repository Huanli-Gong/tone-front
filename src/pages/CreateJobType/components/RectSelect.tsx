import React , { useState , useRef, useEffect } from 'react'
import { Row, Col , Space } from 'antd'
import { EditTwoTone , CheckCircleFilled } from '@ant-design/icons'
import { EditNameModal } from './EditNameModal'
import styles from './index.less'

interface rectSelectProps {
    title : string,
    desc : string,
    data : any,
    name : string,
    onSelect : ( name : string, id : number , select : boolean ) => void,
    onEdit : ( name : string , id : number , alias : string ) => void,
}

export const RectItem : React.FC<any> = ({ item , name , editModalShow , onSelect }) => {

    const [ iconShow , setIconShow ] = useState( false )
    const [ color , setColor ] = useState( '' )

    const isDisableItem = item.name.toLowerCase().indexOf('console') > -1

    const handleItemSelect = () => {
        const select = item.select === true ? false : true
        onSelect( name , item.id , select )
    }

    const handleMouseEnter = () => {
        if ( item.select ) return 
        setIconShow( true )
    }

    useEffect(
        () => {
            setIconShow( item.select )
        }, [ item.select ]
    )

    const hanldeMouseLeave = () => {
        if ( item.select ) return 
        setIconShow( false )
    }

    const handleHoverEdit = () => setColor('#1890ff')

    const handleLeaveEdit = () => setColor('')


    if ( isDisableItem ) 
        return (
            <div className={ styles.setting_item_disable }>
                <div className={ styles.disable_title }>{ item.alias || item.show_name }</div>
                <div className={ styles.rect_disable_desc }>{ item.description }</div>
            </div>
        )

    return (
        <div className={ `${ item.select ? styles.setting_item_active : styles.setting_item }` }
            onMouseEnter={ handleMouseEnter }
            onMouseLeave={ hanldeMouseLeave }
            onClick={ handleItemSelect }
        >
            <div 
                onClick={ editModalShow }
                onMouseLeave={ handleLeaveEdit }
                onMouseEnter={ handleHoverEdit }
                className="rect_title"
            >
                <Space>
                    <span style={{ color }} className={ styles.edit_word }>{ item.alias || item.show_name }</span>
                    { color && <EditTwoTone /> }
                    {/* <span>{ item.id }</span> */}
                </Space>
            </div>
            <div className={ styles.rect_item_desc }>{ item.description }</div>
            {
                ( item.select || iconShow ) && 
                <CheckCircleFilled 
                    className={ styles.rect_circle_style } 
                    style={{ color : item.select ? '#1890FF' : 'rgba(0,0,0,.25)' }}
                /> 
            }
        </div>
    )
}

export const RectSelect : React.FC<rectSelectProps> = ({ title , desc , data , name ,  onSelect , onEdit }) => {
    const ref : any = useRef()

    const handleOk = ( alias : string , id : number  ) => {
        onEdit( name , id , alias )
    }

    return (
        <Row className={ styles.step_row_mt }>
            <Col span={24}>
                <span className={ styles.step_title }>{ title }</span>
                <span className={ styles.step_desc }>{ desc }</span>
            </Col>
            <Col style={{margin: '0px -10px', display: 'flex', flexFlow: 'row wrap'}}>
                {data.map(( item: any , index : number ) => (
                    !item.disable && 
                    <RectItem
                        key={ index }
                        item={ item }
                        onSelect={ onSelect }
                        name={ name }
                        editModalShow={ () => ref.current.show( item ) }
                    />
                    ))
                }
            </Col>
            <EditNameModal ref={ ref } onOk={ handleOk } />
        </Row>
    )
}