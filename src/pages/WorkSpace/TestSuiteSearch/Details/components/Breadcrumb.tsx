import { Breadcrumb } from 'antd';
import { history } from 'umi'
import styled from 'styled-components'

const LinkSpan = styled.span`
  cursor:pointer;
`
export const BreadcrumbMatch = ({ suiteName, confName, suiteId }: any) => {
  const urlObj = new URL(window.location.href)
  const { pathname } = urlObj
  const path = pathname && pathname.substring(0, pathname.lastIndexOf('/'))
  // console.log('urlObj:', urlObj)
  // console.log('suiteId:', suiteId )

  const handleClick = (href: string) => history.push(href)

  return (
    <>
      <Breadcrumb style={{ marginBottom: 10 }}>
        <Breadcrumb.Item>
          <LinkSpan onClick={() => handleClick(path)} >Test Suite</LinkSpan>
        </Breadcrumb.Item>
        {(suiteName && !confName) && (
          <Breadcrumb.Item>{suiteName}</Breadcrumb.Item>
        )}
        {(suiteName && confName) && (
          <>
            <Breadcrumb.Item >
              <LinkSpan onClick={() => handleClick(`${path}/suite_Details?suite_id=${suiteId}&suite_name=${encodeURIComponent(suiteName)}`)}>
                {suiteName}
              </LinkSpan>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{confName}</Breadcrumb.Item>
          </>
        )}
      </Breadcrumb>
    </>
  )
};