import React from 'react';
import styled from 'styled-components';
import { COLORS } from '../colors';
const Wrapper = styled.div`
  margin: 4px;
  border-radius: 6px;
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
