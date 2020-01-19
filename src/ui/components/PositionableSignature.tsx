import React, { FC, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import interact from 'interactjs';

interface Props {
  path: string;
  onChange: (position: { x: number; y: number }, width: number) => void;
}

const InteractiveContainer = styled.div`
  touch-action: none;
  position: absolute;
  top: 0px;
  left: 0px;
  border: 2px dashed ${p => p.theme.palette.secondary.main};
`;

const SignatureImage = styled.img`
  display: block;
  width: 100%;
`;

const Corner = styled.div`
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${p => p.theme.palette.common.white};
  border: 1px solid ${p => p.theme.palette.secondary.main};

  &.corner-top {
    top: -8px;
  }

  &.corner-bottom {
    bottom: -8px;
  }

  &.corner-left {
    left: -8px;
  }

  &.corner-right {
    right: -8px;
  }
`;

const PositionableSignature: FC<Props> = ({ path, onChange }) => {
  const position = useRef({ x: 0, y: 0 });
  const width = useRef(120);
  const onChangeCallback = useCallback(() => {
    // We can't count with border so we need to count with it (image is inside it)
    // We also count only with whole pixels
    onChange(
      { x: Math.round(position.current.x + 2), y: Math.round(position.current.y + 2) },
      Math.round(width.current - 4),
    );
  }, [onChange, position, width]);
  useEffect(() => {
    interact('#signature')
      .draggable({
        modifiers: interact.modifiers
          ? [
              interact.modifiers.restrictRect({
                restriction: 'parent',
                endOnly: false,
              }),
            ]
          : [],
        autoScroll: true,
        onmove: event => {
          const target = event.target;
          position.current.x += event.dx;
          position.current.y += event.dy;
          target.style.transform =
            'translate(' + position.current.x + 'px, ' + position.current.y + 'px)';
        },
        onend: onChangeCallback,
      })
      .resizable({
        edges: {
          left: '.corner-left',
          right: '.corner-right',
          bottom: '.corner-bottom',
          top: '.corner-top',
        },
        modifiers: interact.modifiers
          ? [
              // keep the edges inside the parent
              interact.modifiers.restrictEdges({
                outer: 'parent',
                endOnly: false,
              }),

              // minimum size
              interact.modifiers.restrictSize({
                min: { width: 10, height: 10 },
              }),
            ]
          : [],
        preserveAspectRatio: true,
        onmove: event => {
          const target = event.target;
          width.current = event.rect.width;
          target.style.width = width.current + 'px';

          // translate when resizing from top or left edges
          position.current.x += event.deltaRect.left;
          position.current.y += event.deltaRect.top;
          target.style.transform =
            'translate(' + position.current.x + 'px, ' + position.current.y + 'px)';
        },
        onend: onChangeCallback,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <InteractiveContainer
      id="signature"
      style={{
        translate: `translate(${position.current.x}px, ${position.current.y}px)`,
        width: width.current,
      }}
    >
      <SignatureImage src={`file://${path}`} />

      <Corner className="corner-top corner-left" />
      <Corner className="corner-top corner-right" />
      <Corner className="corner-bottom corner-left" />
      <Corner className="corner-bottom corner-right" />
    </InteractiveContainer>
  );
};

export default PositionableSignature;
