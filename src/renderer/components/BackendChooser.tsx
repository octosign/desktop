import React, { FC } from 'react';
import styled from 'styled-components';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import DoneIcon from '@material-ui/icons/Done';
import { useTranslation } from 'react-i18next';

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

const BackendChooser: FC<Props> = ({ show, backends, chosenBackend, setChosenBackend }) => {
  const { t } = useTranslation();

  const chips = backends.map(backend => {
    if (backend.available !== true) {
      return (
        <Tooltip key={backend.slug} title={t(backend.available) as string} placement="bottom">
          <span>
            <Chip label={t(backend.config.name)} disabled />
          </span>
        </Tooltip>
      );
    }

    return (
      <Chip
        key={backend.slug}
        label={t(backend.config.name)}
        clickable
        color={chosenBackend === backend.slug ? 'secondary' : 'default'}
        deleteIcon={<DoneIcon />}
        // Dummy callback so icon is displayed
        onDelete={chosenBackend === backend.slug ? () => 0 : undefined}
        onClick={() => setChosenBackend(backend.slug)}
      />
    );
  });

  return show ? <Container>{chips}</Container> : null;
};

export default React.memo(BackendChooser);
