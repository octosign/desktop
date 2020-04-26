import React, { FC, useState, useCallback } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import styled from 'styled-components';
import { format } from 'date-fns';
import mime from 'mime-types';
import { useSnackbar } from 'notistack';

import Prompt from './Prompt';
import PromptRequest from '../../shared/PromptRequest';

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

const FileCard: FC<{ file: File; supported: boolean }> = ({ file, supported }) => {
  const [signing, setSigning] = useState(false);
  const [promptRequest, setPromptRequest] = useState<{
    request: PromptRequest;
    onResponse: (response: string | undefined) => void;
  }>();
  const { enqueueSnackbar } = useSnackbar();

  const onSign = useCallback(async () => {
    setSigning(true);

    try {
      await window.OctoSign.sign(
        file.path,
        message => enqueueSnackbar(message, { variant: 'error' }),
        request =>
          new Promise(resolve => {
            setPromptRequest({
              request,
              onResponse: resolve,
            });
          }),
      );
      // TODO: Change state instead
      enqueueSnackbar('Document was signed successfully', { variant: 'success' });
    } catch (err) {
      // TODO: This means it'll remain in previous state
      enqueueSnackbar('Document was not signed successfully', { variant: 'error' });
    }

    setSigning(false);
  }, [enqueueSnackbar, file.path]);

  const hrFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const unit = Math.floor(Math.log(bytes) / Math.log(1000));

    return parseFloat((bytes / Math.pow(1000, unit)).toFixed(2)) + ' ' + units[unit];
  };

  const ext = mime.extension(file.type);
  const name = ext !== false ? file.name.replace(/\.[^/.]+$/, '') : file.name;

  const signButton =
    signing || !supported ? (
      <Tooltip title={signing ? 'Signing in progress' : 'File type not supported'}>
        <span>
          <Button onClick={onSign} color="secondary" disabled>
            Sign
          </Button>
        </span>
      </Tooltip>
    ) : (
      <Button onClick={onSign} color="secondary">
        Sign
      </Button>
    );

  return (
    <>
      <Prompt file={file} request={promptRequest} />

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

          <Status
            state={signing ? 'signing' : 'default'}
            label={signing ? 'Signing...' : 'Unsigned'}
          />

          <Typography color="textSecondary">Size: {hrFileSize(file.size)}</Typography>
          <Typography color="textSecondary">
            Last modified: {format(file.lastModified, 'Pp')}
          </Typography>
        </CardContent>
        <CardActions>{signButton}</CardActions>
      </CardContainer>
    </>
  );
};

export default FileCard;
