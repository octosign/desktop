import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import { format } from 'date-fns';
import mime from 'mime-types';
import styled from 'styled-components';
import { FileCardStatus } from './FileCard';

const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const Status = styled(Chip)<{ $bgcolor: string }>`
  width: 100%;
  margin: 0.75rem 0 1rem 0;
  font-size: 1rem;
  font-weight: 500;
  background-color: ${p =>
    p.$bgcolor === 'grey' ? p.theme.palette.grey[500] : p.theme.palette[p.$bgcolor].main};
  color: ${p =>
    p.$bgcolor === 'grey' ? p.theme.palette.grey[50] : p.theme.palette[p.$bgcolor].contrastText};
`;

const FileCardContent: FC<{ file: File; status: FileCardStatus }> = ({ file, status }) => {
  const { t } = useTranslation();

  const hrFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const unit = Math.floor(Math.log(bytes) / Math.log(1000));

    return parseFloat((bytes / Math.pow(1000, unit)).toFixed(2)) + ' ' + units[unit];
  };

  const ext = mime.extension(file.type);
  const name = ext !== false ? file.name.replace(/\.[^/.]+$/, '') : file.name;

  const hrStatus = {
    SIGNING: t('Signing...'),
    VERIFYING: t('Verifying...'),
    SIGNED: t('Signed'),
    UNSIGNED: t('Unsigned'),
    UNKNOWN: t('Unknown'),
    INVALID: t('Invalid'),
  };

  const statusColor = {
    SIGNING: 'secondary',
    VERIFYING: 'secondary',
    SIGNED: 'success',
    UNSIGNED: 'grey',
    UNKNOWN: 'grey',
    INVALID: 'error',
  };

  return (
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

      <Status $bgcolor={statusColor[status]} label={hrStatus[status]} />

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
  );
};

export default FileCardContent;
