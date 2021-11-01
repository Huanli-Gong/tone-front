import React from 'react'

type ServerBlock = {
    className?: string;
    style?:any;
}

export const ServerJumpBlock: React.FC<ServerBlock> = (props) => <span {...props}>{props.children}</span>