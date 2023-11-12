import React, { FC, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { useTranslation } from 'react-i18next';

import pencilCursor from '../static/pencil-cursor.svg';
import LabelButton from './LabelButton';

interface Props {
  onChange: (value: string, confirm?: boolean) => void;
  onCanvasData: (data: string) => void;
}

const Container = styled.div`
    position: relative;
    border: 1px solid ${p => p.theme.palette.grey[100]};
    border-bottom: 3px solid ${p => p.theme.palette.grey[900]};
    cursor: url('${pencilCursor}') 0 16, crosshair;

    canvas {
        display: block;
    }
`;

const Controls = styled.div`
  position: absolute;
  top: ${p => p.theme.spacing(1)}px;
  right: ${p => p.theme.spacing(1)}px;
`;

const InvisibleButtonInput = styled.input`
  display: none;
`;

const ImagePrompt: FC<Props> = ({ onChange, onCanvasData }) => {
  const apiRef = useRef<SignatureCanvas | null>(null);
  const { t } = useTranslation();

  return (
    <Container>
      <Controls>
        <InvisibleButtonInput
          accept=".gif,.jpg,.png"
          id="button-signature-file"
          type="file"
          onChange={e => e.target.files?.length && onChange(e.target.files[0].path, true)}
        />
        <ButtonGroup
          size="small"
          variant="contained"
          color="default"
          aria-label="small contained default button group"
        >
          <Button onClick={() => apiRef.current?.clear()}>{t('Clear')}</Button>
          <LabelButton
            htmlFor="button-signature-file"
            label={t('Choose image')}
            groupPosition="right"
          />
        </ButtonGroup>
      </Controls>

      <SignatureCanvas
        ref={api => {
          apiRef.current = api;
        }}
        penColor="blue"
        canvasProps={{ width: 500, height: 200 }}
        minWidth={1}
        maxWidth={3}
        onEnd={() => onCanvasData(apiRef.current!.toDataURL('image/png'))}
      />
    </Container>
  );
};

export default ImagePrompt;
