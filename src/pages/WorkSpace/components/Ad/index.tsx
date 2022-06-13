import React from "react"
import styled from "styled-components"

const AdContainer = styled.div`
    position: fixed;
    left: 0 ;
    top: 0;
    bottom: 0;
    right: 0;
    background-color: #fff;
    backdrop-filter: blur(5px);
    z-index: 9999;
`

const AdCompoent: React.FC = () => {

    return (
        <AdContainer>

        </AdContainer>
    )
}

export default AdCompoent