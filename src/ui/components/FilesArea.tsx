import React, { FC } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { useTranslation } from 'react-i18next';

import FileCard from './FileCard';

interface Props {
  files: File[];
  isDragActive: boolean;
  supports: string[];
  chosenBackend?: string;
  openPicker: () => void;
  onFileChanged: (oldFile: File, newFile: File) => void;
}

const Container = styled.div`
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
  justify-content: center;
  overflow-y: auto;
  max-height: calc(100vh - 7rem);
`;

const FilesArea: FC<Props> = ({
  files,
  isDragActive,
  openPicker,
  supports,
  chosenBackend,
  onFileChanged,
}) => {
  const { t } = useTranslation();

  return (
    <Container onClick={files.length === 0 ? openPicker : undefined}>
      {files.length === 0 ? (
        <Box marginBottom={1.5}>
          <Typography align="center" color={isDragActive ? 'secondary' : 'primary'} variant="h2">
            {isDragActive ? t('Drop your files here') : t('Sign a new document')}
          </Typography>
        </Box>
      ) : (
        <Cards>
          {files.map(file => (
            <FileCard
              key={file.path || file.name}
              file={file}
              supported={supports.includes(file.type)}
              chosenBackend={chosenBackend}
              onFileChanged={(newFile: File) => onFileChanged(file, newFile)}
            />
          ))}
        </Cards>
      )}
    </Container>
  );
};

export default React.memo(FilesArea);
