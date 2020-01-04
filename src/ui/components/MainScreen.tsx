import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { useDropzone } from 'react-dropzone';
import Box from '@material-ui/core/Box';
import { lighten } from '@material-ui/core/styles';

import Footer from './Footer';
import FileCard from './FileCard';

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

const Content = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Cards = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  overflow-y: auto;
  max-height: calc(100vh - 7rem);
`;

const MainScreen = () => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => setFiles(acceptedFiles), []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    accept: 'application/pdf',
    onDragEnter: undefined,
    onDragOver: undefined,
    onDragLeave: undefined,
    noClick: true,
  });

  return (
    <Container {...getRootProps()} active={isDragActive}>
      <input {...getInputProps()} />

      <Content onClick={files.length === 0 ? open : undefined}>
        {files.length === 0 ? (
          <Box marginBottom={1.5}>
            <Typography align="center" color={isDragActive ? 'secondary' : 'primary'} variant="h2">
              {isDragActive ? 'Drop your files here' : 'Sign a new document'}
            </Typography>
          </Box>
        ) : (
          <Cards>
            {files.map(f => (
              <FileCard key={f.name + f.lastModified + f.size} file={f} />
            ))}
          </Cards>
        )}
      </Content>

      <Footer onSelectFiles={open} />
    </Container>
  );
};

export default MainScreen;
