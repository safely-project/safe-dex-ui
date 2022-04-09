import React from 'react';
import styled from 'styled-components';
import { COLORS } from '../colors';
const Wrapper = styled.div`
  margin: 1px;
  //border-radius: 6px;
  // box-shadow: 0px 5px 15px -7px rgb(0 0 0 / 38%),
  //  0px 10px 13px -5px rgb(19 21 60 / 19%);
`;

export default function FloatingElement({
  style = undefined,
  children,
  stretchVertical = false,
}) {
  return (
    <Wrapper
      style={{
        height: stretchVertical ? 'calc(100% - 10px)' : undefined,
        ...style,
        backgroundColor: COLORS.primary,
      }}
    >
      {children}
    </Wrapper>
  );
}
