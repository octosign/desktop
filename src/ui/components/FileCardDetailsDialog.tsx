import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import ReactMarkdown from 'react-markdown';

interface Props {
  details?: string;
  open: boolean;
  onClose: () => void;
}

const StyledReactMarkdown = styled(ReactMarkdown)`
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  strong {
    font-weight: 500;
    margin: 0 0 0.5rem 0;
  }

  p,
  ol {
    margin: 0;
  }
`;

const FileCardDetailsDialog: FC<Props> = ({ details, open, onClose }) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="details-dialog-title"
    >
      <DialogTitle id="details-dialog-title">{t('Signature details')}</DialogTitle>
      <DialogContent>
        <StyledReactMarkdown>{details}</StyledReactMarkdown>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {t('Close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileCardDetailsDialog;
