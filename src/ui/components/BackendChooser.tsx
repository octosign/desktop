import React, { FC } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import DoneIcon from '@material-ui/icons/Done';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

import BackendState from '../../shared/BackendState';

interface Props {
  show: boolean;
  backends: BackendState[];
  chosenBackend?: string;
  setChosenBackend: (slug: string) => void;
}

const Container = styled.div`
  .MuiChip-root:not(:first-child) {
    margin-left: ${p => p.theme.spacing(1)}px;
  }
`;

const GlobalStyle = createGlobalStyle`
  .MuiTooltip-tooltip {
    background-color: ${p => (p.theme as Theme).palette.common.white};
    color: rgba(0, 0, 0, 0.87);
    box-shadow: ${p => (p.theme as Theme).shadows[1]};
    font-size: 12px;
  }
`;

const BackendChooser: FC<Props> = ({ show, backends, chosenBackend, setChosenBackend }) => {
  const chips = backends.map(backend => {
    if (backend.available !== true) {
      return (
        <Tooltip key={backend.slug} title={backend.available} placement="bottom">
          <span>
            <Chip label={backend.config.name} disabled />
          </span>
        </Tooltip>
      );
    }

    return (
      <Chip
        key={backend.slug}
        label={backend.config.name}
        clickable
        color={chosenBackend === backend.slug ? 'secondary' : 'default'}
        deleteIcon={<DoneIcon />}
        // Dummy callback so icon is displayed
        onDelete={chosenBackend === backend.slug ? () => 0 : undefined}
        onClick={() => setChosenBackend(backend.slug)}
      />
    );
  });

  return show ? (
    <>
      <GlobalStyle />
      <Container>{chips}</Container>
    </>
  ) : null;
};

export default React.memo(BackendChooser);
