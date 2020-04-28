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
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
        enqueueSnackbar(t('You need to draw your signature or select file.'), {
          variant: 'warning',
        });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      finalValue = useCanvasData ? await window.createTmpImage(canvasData!) : finalValue;

      request?.onResponse(finalValue);
      setOpen(false);
      setValue(undefined);
    },
    [t, request, canvasData, enqueueSnackbar],
  );
  const { question, promptType, defaultValue, options } = request?.request || {};

  let title = question;
  let content: React.ReactNode;
  let maxWidth: 'sm' | 'md' | undefined = 'md';
  let fullScreen = false;
  let fullWidth = true;
  let useCanvasData = false;
  let plainContent = false;
  switch (promptType) {
    case 'text':
    case 'password':
      maxWidth = 'sm';
      content = (
        <TextField
          autoFocus
          margin="dense"
          id="prompt-field"
          label={promptType === 'password' ? t('Password') : t('Text')}
          type={promptType}
          onChange={e => setValue(e.target.value)}
          defaultValue={defaultValue}
          fullWidth
        />
      );
      break;

    case 'position':
      fullScreen = true;
      title = t('Pick page and position for you signature');
      content = <Position onChange={setValue} file={file} signature={defaultValue as string} />;
      break;

    case 'image':
      title = t('Draw your signature or pick saved image');
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

    case 'single':
      fullWidth = false;
      maxWidth = undefined;
      plainContent = true;
      content = (
        <List>
          {(options || []).map(option => (
            <ListItem key={option.key} button onClick={() => onConfirm(option.key)}>
              <ListItemText primary={option.value} />
            </ListItem>
          ))}
        </List>
      );
      break;

    case 'boolean':
      fullWidth = false;
      plainContent = true;
      content = (
        <DialogActions>
          <Button onClick={() => onConfirm('1')} color="primary">
            {t('Yes')}
          </Button>
          <Button onClick={() => onConfirm('0')} color="primary" autoFocus>
            {t('No')}
          </Button>
        </DialogActions>
      );
      break;

    default:
      maxWidth = 'sm';
      const type = request?.request.promptType;
      content = (
        <DialogContentText>
          {t(
            'Prompt type "{{type}}" is not yet supported. Please open a feature request on the Octosign repository.',
            { type },
          )}
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
                {t('Confirm')}
              </Button>
            </Toolbar>
          </AppBar>
          {content}
        </>
      ) : (
        <>
          <DialogTitle id="prompt-dialog-title">{title}</DialogTitle>
          {plainContent ? (
            content
          ) : (
            <>
              {' '}
              <DialogContent>{content}</DialogContent>
              <DialogActions>
                <Button onClick={() => onConfirm()}>{t('Cancel')}</Button>
                <Button onClick={() => onConfirm(value, useCanvasData)} color="primary">
                  {t('Confirm')}
                </Button>
              </DialogActions>
            </>
          )}
        </>
      )}
    </Dialog>
  );
};

export default Prompt;
