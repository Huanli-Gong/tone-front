import React from 'react'

import { Avatar } from 'antd'

interface Props {
    size : 'large' | 'small' 
    show_name? : string
    style?: any
    theme_color? : string
    logo?:string
}

const AvatarCover = ( props : Props ) => {
    const { size , show_name , style , theme_color , logo } = props 

    if ( logo ) 
        return (
            <Avatar 
                shape="square" 
                size={ size === 'large' ? 80 : 32 } 
                src={ logo } 
                style={{ borderRadius : size === "large" ? 8 : 4 , ...style }} 
            />
        )

    let coverStyle : any = {
        borderRadius : 4,
        fontSize : 14,
        fontWeight : 'bold',
        width : 32,
        height : 32,
        textAlign : 'center',
        lineHeight : '32px',
        color : '#fff',
        background : theme_color,
    }

    if ( size === 'large' ) {
        coverStyle = Object.assign( coverStyle , {
            borderRadius : 8, 
            fontSize : 38, 
            width : 80, 
            height : 80, 
            lineHeight : '80px'
        })
    }
  
    return (
        <div style={{ ...coverStyle , ...style }}>
            { show_name?.slice( 0 , 1 ) }
        </div>
    )
}

export default AvatarCover