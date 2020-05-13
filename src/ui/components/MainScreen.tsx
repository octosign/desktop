import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { lighten } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

import Footer from './Footer';
import BackendChooser from './BackendChooser';
import SettingsDialog from './SettingsDialog';
import BackendState from '../../shared/BackendState';
import FilesArea from './FilesArea';

const Container = styled.div<{ active: boolean }>`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: ${p =>
    p.active ? lighten(p.theme.palette.secondary.main, 0.9) : p.theme.palette.background.default};
  border: 0.25rem solid
    ${p => (p.active ? p.theme.palette.secondary.main : p.theme.palette.background.default)};
  transition: background-color 0.15s ease-out, border 0.1s ease-out;
`;

const GlobalStyle = createGlobalStyle`
  .MuiTooltip-tooltip {
    background-color: ${p => (p.theme as Theme).palette.common.white};
    color: rgba(0, 0, 0, 0.87);
    box-shadow: ${p => (p.theme as Theme).shadows[1]};
    font-size: 12px;
  }
`;

const MainScreen = () => {
  const apiReady = useRef(false);
  const [backends, setBackends] = useState<BackendState[]>([]);
  const [chosenBackend, setChosenBackend] = useState<string>();
  useEffect(() => {
    (async () => {
      await window.apiReady;
      apiReady.current = true;
      const backends = await window.OctoSign.list();
      setBackends(backends);
      const firstAvailable = backends.find(b => b.available === true);
      setChosenBackend(firstAvailable?.slug);
      window.OctoSign.set(firstAvailable?.slug);
    })();
  }, []);
  const backend = useMemo(() => backends.find(b => b.slug === chosenBackend), [
    chosenBackend,
    backends,
  ]);
  const onSetChosenBackend = useCallback(backend => {
    setChosenBackend(backend);
    window.OctoSign.set(backend);
  }, []);

  const [settingsOpened, setSettingsOpened] = useState(false);
  const onSettingsOpen = useCallback(() => setSettingsOpened(true), []);
  const onSettingsClose = useCallback(() => setSettingsOpened(false), []);

  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: File[]) => setFiles(acceptedFiles), []);
  const onFileChanged = useCallback((oldFile: File, newFile: File) => {
    setFiles(files => files.map(f => (f === oldFile ? newFile : f)));
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    onDragEnter: undefined,
    onDragOver: undefined,
    onDragLeave: undefined,
    noClick: true,
  });

  return (
    <Container {...getRootProps()} active={isDragActive}>
      <GlobalStyle />
      <input {...getInputProps()} />

      <BackendChooser
        show={files.length > 0}
        backends={backends}
        chosenBackend={chosenBackend}
        setChosenBackend={onSetChosenBackend}
      />

      <FilesArea
        files={files}
        isDragActive={isDragActive}
        openPicker={open}
        chosenBackend={chosenBackend}
        supports={backend?.supports}
        onFileChanged={onFileChanged}
      />

      <SettingsDialog open={settingsOpened} backends={backends} onClose={onSettingsClose} />

      <Footer onSelectFiles={open} onOpenSettings={onSettingsOpen} />
    </Container>
  );
};

export default MainScreen;
