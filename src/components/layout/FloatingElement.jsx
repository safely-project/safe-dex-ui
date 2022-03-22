import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  margin: 4px;
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
        backgroundColor: '#1a2029',
      }}
    >
      {children}
    </Wrapper>
  );
}
