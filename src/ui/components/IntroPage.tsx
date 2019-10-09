import React, { useCallback, useState } from 'react';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { useDropzone } from 'react-dropzone';
import Box from '@material-ui/core/Box';
import LibraryAddTwoToneIcon from '@material-ui/icons/LibraryAddTwoTone';
import { lighten } from '@material-ui/core/styles';

const Container = styled.div<{ active: boolean }>`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: ${p =>
    p.active ? lighten(p.theme.palette.secondary.main, 0.9) : p.theme.palette.background.default};
  border: ${p => (p.active ? 0.25 : 0)}rem solid ${p => p.theme.palette.secondary.main};
  transition: background-color 200ms ease-out, border 100ms ease-out;
`;

const FilesIcon = styled(LibraryAddTwoToneIcon)`
  font-size: 6rem;
  margin-bottom: ${p => p.theme.spacing(4)};
  transition: color 200ms ease-out;
`;

const IntroPage = () => {
  const [isSigning, setIsSigning] = useState(false);

  const onDrop = useCallback(async acceptedFiles => {
    setIsSigning(true);

    try {
      await window.OctoSign.sign(acceptedFiles[0].path);
    } catch (err) {
      alert(err);
    }

    setIsSigning(false);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'application/pdf',
  });

  return (
    <Container {...getRootProps()} active={isDragActive}>
      {isSigning ? (
        <Box marginBottom={1.5}>
          <Typography>Signing...</Typography>
        </Box>
      ) : (
        <>
          <input {...getInputProps()} />
          <FilesIcon color={isDragActive ? 'secondary' : 'disabled'} />
          <Box marginBottom={1.5}>
            <Typography>Drag and drop some files here, or click to select files.</Typography>
          </Box>
          <Button variant="contained" color="primary">
            Select files
          </Button>
        </>
      )}
    </Container>
  );
};

export default IntroPage;
