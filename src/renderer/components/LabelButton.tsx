import React, { FC, ComponentProps } from 'react';
import Button from '@material-ui/core/Button';
import styled, { css } from 'styled-components';

interface Props extends ComponentProps<typeof Button> {
  htmlFor: string;
  label: string;
  /**
   * If button is inside ButtonGroup, specify its position
   */
  groupPosition?: 'middle' | 'left' | 'right' | 'top' | 'bottom';
}

const RadiusAdjustedButton = styled(Button)<{
  position: Props['groupPosition'];
  // Workaround since mui Button is using this prop
  component: string;
}>`
    ${p =>
      p.position === 'middle' &&
      css`
        border-radius: 0;
      `}

    ${p =>
      p.position === 'left' &&
      css`
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
      `}

    ${p =>
      p.position === 'right' &&
      css`
        border-bottom-left-radius: 0;
        border-top-left-radius: 0;
      `}

    ${p =>
      p.position === 'top' &&
      css`
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      `}

    ${p =>
      p.position === 'bottom' &&
      css`
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      `}
`;

const LabelButton: FC<Props> = ({ htmlFor, label, groupPosition, ...props }) => {
  return (
    <label htmlFor={htmlFor}>
      <RadiusAdjustedButton position={groupPosition} component="span" {...props}>
        {label}
      </RadiusAdjustedButton>
    </label>
  );
};

export default LabelButton;
