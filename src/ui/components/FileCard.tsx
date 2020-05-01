import React, { FC, useState, useCallback, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import styled from 'styled-components';
import { format } from 'date-fns';
import mime from 'mime-types';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import Prompt from './Prompt';
import PromptRequest from '../../shared/PromptRequest';
import { SignatureStatus } from '../../shared/BackendResults';

interface Props {
  file: File;
  supported: boolean;
  chosenBackend?: string;
}

const Status = styled(Chip)<{ state: 'default' | 'signing' }>`
  width: 100%;
  margin: 0.75rem 0 1rem 0;
  font-size: 1rem;
  font-weight: 500;
  background-color: ${p =>
    p.state === 'signing' ? p.theme.palette.secondary.main : p.theme.palette.grey[300]};
  color: ${p =>
    p.state === 'signing'
      ? p.theme.palette.secondary.contrastText
      : p.theme.palette.text.secondary};
`;

const CardContainer = styled(Card)`
  margin: 0.5rem;
  width: 360px;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

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

const FileCard: FC<Props> = ({ file, supported, chosenBackend }) => {
  const [status, setStatus] = useState<'VERIFYING' | 'SIGNING' | SignatureStatus['status']>(
    'UNKNOWN',
  );
  const [details, setDetails] = useState<string>();
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [promptRequest, setPromptRequest] = useState<{
    request: PromptRequest;
    onResponse: (response: string | undefined) => void;
  }>();
  const onPromptRequest = (request: PromptRequest) =>
    new Promise<string | undefined>(resolve => {
      setPromptRequest({
        request,
        onResponse: resolve,
      });
    });
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  useEffect(() => {
    setStatus('VERIFYING');
    (async () => {
      try {
        const result: SignatureStatus = await window.OctoSign.verify(
          file.path,
          message => enqueueSnackbar(t(message), { variant: 'error' }),
          onPromptRequest,
        );
        setStatus(result.status);
        setDetails(result.details);
      } catch (e) {
        enqueueSnackbar(t('Signature could not be verified'), { variant: 'error' });
        setStatus('UNKNOWN');
        setDetails(undefined);
      }
    })();
    // We are very careful of when we fire verification
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.path, chosenBackend]);

  const onSign = useCallback(async () => {
    setStatus('SIGNING');

    try {
      await window.OctoSign.sign(
        file.path,
        message => enqueueSnackbar(t(message), { variant: 'error' }),
        onPromptRequest,
      );
      setStatus('SIGNED');

      // TODO: Trigger verification instead
    } catch (err) {
      enqueueSnackbar(t('Document could not be signed'), { variant: 'error' });
    }
  }, [t, enqueueSnackbar, file.path]);

  const hrFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const unit = Math.floor(Math.log(bytes) / Math.log(1000));

    return parseFloat((bytes / Math.pow(1000, unit)).toFixed(2)) + ' ' + units[unit];
  };

  const ext = mime.extension(file.type);
  const name = ext !== false ? file.name.replace(/\.[^/.]+$/, '') : file.name;

  const tooltipTextForStatus = {
    SIGNING: t('Signing in progress'),
    VERIFYING: t('Verification in progress'),
  } as { [key in typeof status]: undefined | string };

  const cardButtons =
    status === 'SIGNING' || status === 'VERIFYING' || !supported ? (
      <Tooltip title={tooltipTextForStatus[status] || (t('File type not supported') as string)}>
        <span>
          <Button onClick={onSign} color="secondary" disabled>
            {t('Sign')}
          </Button>
        </span>
      </Tooltip>
    ) : (
      <>
        <Button onClick={onSign} color="secondary">
          {t('Sign')}
        </Button>
        {status === 'SIGNED' && details && (
          <Button onClick={() => setDetailsOpen(true)} color="secondary">
            {t('Open signature details')}
          </Button>
        )}
      </>
    );

  const hrStatus = {
    SIGNING: t('Signing...'),
    VERIFYING: t('Verifying...'),
    SIGNED: t('Signed'),
    UNSIGNED: t('Unsigned'),
    UNKNOWN: t('Unknown'),
    INVALID: t('Invalid'),
  };

  return (
    <>
      <Prompt file={file} request={promptRequest} />
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="details-dialog-title"
      >
        <DialogTitle id="details-dialog-title">{t('Signature details')}</DialogTitle>
        <DialogContent>
          <StyledReactMarkdown>{details}</StyledReactMarkdown>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)} color="secondary">
            {t('Close')}
          </Button>
        </DialogActions>
      </Dialog>

      <CardContainer>
        <CardContent>
          <TitleContainer>
            <Typography variant="h5" component="h2" gutterBottom noWrap title={file.name}>
              {name}
            </Typography>
            {ext !== false && (
              <Typography variant="h5" component="span" gutterBottom title={file.name}>
                .{ext.toUpperCase()}
              </Typography>
            )}
          </TitleContainer>

          <Status state={status === 'SIGNING' ? 'signing' : 'default'} label={hrStatus[status]} />

          <Typography color="textSecondary">
            {t('Size: {{size}}', { size: hrFileSize(file.size) })}
          </Typography>
          <Typography color="textSecondary">
            {t('Last modified: {{date}}', {
              date: format(file.lastModified, 'Pp'),
              interpolation: { escapeValue: false },
            })}
          </Typography>
        </CardContent>
        <CardActions>{cardButtons}</CardActions>
      </CardContainer>
    </>
  );
};

export default FileCard;
