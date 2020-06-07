import React, { FC, useState, useCallback, useEffect } from 'react';
import Card from '@material-ui/core/Card';

import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import styled from 'styled-components';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import Prompt from './Prompt';
import PromptRequest from '../../shared/PromptRequest';
import { SignatureStatus } from '../../shared/BackendResults';
import FileCardContent from './FileCardContent';
import FileCardDetailsDialog from './FileCardDetailsDialog';
import makeCancelable from '../../shared/makeCancelable';

interface Props {
  file: File;
  supported: boolean;
  chosenBackend?: string;
  onFileChanged: (newFile: File) => void;
}

export type FileCardStatus = 'VERIFYING' | 'SIGNING' | SignatureStatus['status'];

const CardContainer = styled(Card)`
  margin: 0.5rem;
  width: 360px;
`;

const FileCard: FC<Props> = ({ file, supported, chosenBackend, onFileChanged }) => {
  const [status, setStatus] = useState<FileCardStatus>('UNKNOWN');
  const [details, setDetails] = useState<string>();
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [signAttempts, setSignAttempts] = useState(0);

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
    let cancelVerification: () => void;
    (async () => {
      try {
        const cancelable = makeCancelable(
          window.OctoSign.verify(
            file.path,
            message => enqueueSnackbar(t(message), { variant: 'error' }),
            onPromptRequest,
          ),
        );
        cancelVerification = cancelable.cancel;
        const result: SignatureStatus = await cancelable.promise;
        setStatus(result.status);
        setDetails(result.details);
      } catch (e) {
        if ('cancelled' in e) return;
        enqueueSnackbar(t('Signature could not be verified'), { variant: 'error' });
        setStatus('UNKNOWN');
        setDetails(undefined);
      }
    })();

    return () => cancelVerification && cancelVerification();
    // We are very careful of when we fire verification
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.path, chosenBackend, signAttempts]);

  const onSign = useCallback(async () => {
    setStatus('SIGNING');

    try {
      const outputPath = await window.OctoSign.sign(
        file.path,
        message => enqueueSnackbar(message, { variant: 'error' }),
        onPromptRequest,
      );
      if (outputPath && outputPath !== file.path) {
        onFileChanged(await window.pathToFile(outputPath));
      } else {
        setSignAttempts(v => v + 1);
      }
    } catch (err) {
      enqueueSnackbar(t('Document could not be signed'), { variant: 'error' });
      setSignAttempts(v => v + 1);
    }
  }, [t, enqueueSnackbar, file.path, onFileChanged]);

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
        {details && (
          <Button onClick={() => setDetailsOpen(true)} color="secondary">
            {t('Open signature details')}
          </Button>
        )}
      </>
    );

  return (
    <>
      <Prompt file={file} request={promptRequest} />
      <FileCardDetailsDialog
        details={details}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />

      <CardContainer>
        <FileCardContent file={file} status={status} />

        <CardActions>{cardButtons}</CardActions>
      </CardContainer>
    </>
  );
};

export default FileCard;
