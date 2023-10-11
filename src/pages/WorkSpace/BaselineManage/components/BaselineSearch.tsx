import React from "react";
import { FilterFilled } from "@ant-design/icons";
import { Row, Input, Divider, Typography } from "antd"
import { useIntl } from "umi";
import { useClickAway } from "ahooks";
import styled from "styled-components";

const SearchFooter = styled.div`
    width: 100;
    height: 100%;

    .ant-typography {
        width: 50%;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: normal;
    }
`

const SearchRow = styled.div`
    padding: 8px 20px;
`

const SearchContainer = styled(Row)`
    box-shadow: 0 9px 28px 8px rgb(0 0 0 / 5%), 0 6px 16px 0 rgb(0 0 0 / 8%), 0 3px 6px -4px rgb(0 0 0 / 12%);
    border-radius: 4px;
    flex-direction: column;
    background-color: #fff;
    width: 395px;
    position: absolute;
    bottom: 0;
    right: -10px;
    transform: translateY(100%);
`

const FilterSpanWrapper = styled.span`
    height: 100%;
    padding-left: 4px;
    padding-right: 4px;
    display: inline-block;
    color: #bfbfbf;
    &:hover {
        color: rgba(0, 0, 0, 0.45);
        background: rgba(0, 0, 0, 0.04);
        span {
            color: rgba(0, 0, 0, 0.45);
        }
    }
`

type IProps = {
    search?: string;
    onSearch?: (name?: string) => void
} & Record<string, any>

const BaselineSearch: React.FC<IProps> = (props) => {
    const { search, onSearch } = props
    const intl = useIntl()

    const [open, setOpen] = React.useState(false)
    const [inp, setInp] = React.useState<string | undefined>(search)

    const dom = React.useRef<any>(null)

    useClickAway(() => {
        setOpen(false)
        setInp("")
    }, dom)

    const handleSearch = () => {
        onSearch?.(inp)
        setTimeout(() => {
            setOpen(false)
        }, 80)
    }

    const handleRest = () => {
        onSearch?.("")
        setInp("")
        setTimeout(() => {
            setOpen(false)
        }, 80)
    }

    return (
        <span
            style={{ cursor: "pointer", position: "relative" }}
            ref={dom}
            onClick={() => setOpen(true)}
        >
            <FilterSpanWrapper>
                <FilterFilled style={{ color: !!search ? '#1890ff' : undefined }} />
            </FilterSpanWrapper>
            {
                open &&
                <SearchContainer>
                    <SearchRow>
                        <Input.Search
                            value={inp}
                            onChange={(e: any) => setInp(e.target.value)}
                            onPressEnter={() => handleSearch()}
                            placeholder={intl.formatMessage({ id: 'baseline.search.baseline.name' })}
                        />
                    </SearchRow>
                    <Divider style={{ margin: "0" }} />
                    <SearchFooter>
                        <Typography.Link
                            onClick={() => handleSearch()}
                        >
                            {intl.formatMessage({ id: "baseline.search" })}
                        </Typography.Link>
                        <Typography.Text
                            onClick={handleRest}
                        >
                            {intl.formatMessage({ id: "operation.reset" })}
                        </Typography.Text>
                    </SearchFooter>
                </SearchContainer>
            }
        </span>
    )
}

export default BaselineSearch