

import React from "react"

import { ReactComponent as PublicIcon } from '@/assets/svg/public.svg'
import { ReactComponent as NPublicIcon } from '@/assets/svg/no_public.svg'

const WsPublicIcon: React.FC<{ is_public: boolean }> = ({ is_public }) => (
    is_public ?
        <PublicIcon /> :
        <NPublicIcon />
)

export default WsPublicIcon