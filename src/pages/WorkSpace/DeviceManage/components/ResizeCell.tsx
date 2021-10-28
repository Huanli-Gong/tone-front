import React from 'react'
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css'

import styled from 'styled-components'

const StyledResizeable = styled( Resizable )`
    .react-resizable {
        position: relative;
        background-clip: padding-box;
    }
    
    .react-resizable-handle {
        position: absolute;
        width: 10px;
        height: 100%;
        bottom: 0;
        right: -5px;
        cursor: col-resize;
        background-image:none;
        z-index: 1;
    }
`

export const ResizeableTitle = ( props : any ) => {
    const { onResize, width, ...restProps } = props;

    if (!width) {
        return <th {...restProps} />;
    }

    return (
        <StyledResizeable
            width={width}
            height={0}
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
        >
            <th {...restProps} />
        </StyledResizeable>
    );
}