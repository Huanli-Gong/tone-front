/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'

import { DeleteOutlined } from '@ant-design/icons'

export const DeleteFormListItem: React.FC<any> = ({ remove, field, position, deleteCallback }) => {
    const [color, setColor] = useState('')
    return (
        <div
            onMouseEnter={() => setColor('red')}
            onMouseLeave={() => setColor('')}
            style={{
                position: 'absolute',
                ...position,
            }}
        >
            <DeleteOutlined
                onClick={() => {
                    remove(field.name)
                    // deleteCallback()
                }}
                style={{ color }}
            />
        </div>
    )
}