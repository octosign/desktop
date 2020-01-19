import React, { FC, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useSnackbar } from 'notistack';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';

import PromptRequest from '../../shared/PromptRequest';
import Position from './PositionPrompt';
import Image from './ImagePrompt';

interface Props {
  request?: {
    request: PromptRequest;
    onResponse: (response: string | undefined) => void;
  };
  file: File;
}

const FullscreenTitle = styled(Typography)`
  margin-left: ${p => p.theme.spacing(2)}px;
  flex: 1;
`;

const Prompt: FC<Props> = ({ request, file }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>();
  const [canvasData, setCanvasData] = useState<string>();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!request) {
      setOpen(false);
      return;
    }

    // Open on each new request
    setOpen(true);
  }, [request]);
  const onConfirm = useCallback(
    async (finalValue?: string, useCanvasData = false) => {
      if (useCanvasData && !canvasData) {
        enqueueSnackbar('You need to draw your signature or select file.', { variant: 'warning' });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      finalValue = useCanvasData ? await window.createTmpImage(canvasData!) : finalValue;

      request?.onResponse(finalValue);
      setOpen(false);
      setValue(undefined);
    },
    [request, canvasData, enqueueSnackbar],
  );

  let title = request?.request.question;
  let content: React.ReactNode;
  let maxWidth: 'sm' | 'md' = 'md';
  let fullScreen = false;
  let fullWidth = true;
  let useCanvasData = false;
  switch (request?.request.promptType) {
    case 'text':
    case 'password':
      maxWidth = 'sm';
      content = (
        <TextField
          autoFocus
          margin="dense"
          id="prompt-field"
          label={request.request.promptType === 'password' ? 'Password' : 'Text'}
          type={request.request.promptType}
          onChange={e => setValue(e.target.value)}
          defaultValue={request.request.defaultValue}
          fullWidth
        />
      );
      break;

    case 'position':
      fullScreen = true;
      title = 'Pick page and position for you signature';
      content = (
        <Position
          onChange={setValue}
          file={file}
          signature={request.request.defaultValue as string}
        />
      );
      break;

    case 'image':
      title = 'Draw your signature or pick saved image';
      fullWidth = false;
      useCanvasData = true;
      content = (
        <Image
          onChange={(value: string, confirm = false) =>
            confirm ? onConfirm(value) : setValue(value)
          }
          onCanvasData={setCanvasData}
        />
      );
      break;

    default:
      maxWidth = 'sm';
      content = (
        <DialogContentText>
          Prompt type &quot;{request?.request.promptType}&quot; is not yet supported. Please open a
          feature request on the Octosign repository.
        </DialogContentText>
      );
      break;
  }

  return (
    <Dialog
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      fullScreen={fullScreen}
      open={open}
      onClose={() => onConfirm()}
      color="secondary"
      disableBackdropClick
      aria-labelledby="prompt-dialog-title"
    >
      {fullScreen ? (
        <>
          <AppBar color="secondary">
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => onConfirm()}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
              <FullscreenTitle variant="h6">{title}</FullscreenTitle>
              <Button autoFocus color="inherit" onClick={() => onConfirm(value, useCanvasData)}>
                Confirm
              </Button>
            </Toolbar>
          </AppBar>
          {content}
        </>
      ) : (
        <>
          <DialogTitle id="prompt-dialog-title">{title}</DialogTitle>
          <DialogContent>{content}</DialogContent>
          <DialogActions>
            <Button onClick={() => onConfirm()}>Cancel</Button>
            <Button onClick={() => onConfirm(value, useCanvasData)} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default Prompt;
