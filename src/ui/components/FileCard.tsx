import React, { FC, useState, useCallback } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import styled from 'styled-components';
import { format } from 'date-fns';

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
`;

const FileCard: FC<{ file: File }> = ({ file }) => {
  const [signing, setSigning] = useState(false);

  const onSign = useCallback(async () => {
    setSigning(true);

    try {
      await window.OctoSign.sign(file.path);
    } catch (err) {
      alert(err);
    }

    setSigning(false);
  }, []);

  const hrFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const unit = Math.floor(Math.log(bytes) / Math.log(1000));

    return parseFloat((bytes / Math.pow(1000, unit)).toFixed(2)) + ' ' + units[unit];
  };

  return (
    <CardContainer>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {file.name}
        </Typography>

        <Status
          state={signing ? 'signing' : 'default'}
          label={signing ? 'Signing...' : 'Unsigned'}
        />

        <Typography color="textSecondary">Type: {file.type}</Typography>
        <Typography color="textSecondary">Size: {hrFileSize(file.size)}</Typography>
        <Typography color="textSecondary">
          Last modified: {format(file.lastModified, 'Pp')}
        </Typography>
      </CardContent>
      <CardActions>
        <Button onClick={onSign} color="secondary">
          Sign
        </Button>
      </CardActions>
    </CardContainer>
  );
};

export default FileCard;
