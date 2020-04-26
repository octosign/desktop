import React, { FC, useEffect, useRef, useCallback, useState } from 'react';
import pdfjs from 'pdfjs-dist';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { useTranslation } from 'react-i18next';

import PositionableSignature from './PositionableSignature';

interface Props {
  onChange: (value: string) => void;
  file: File;
  signature: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 64px;
  overflow: auto;
  background-color: ${p => p.theme.palette.background.default};
`;

const Controls = styled.div`
  position: absolute;
  top: ${p => 64 + p.theme.spacing(1)}px;
  right: ${p => p.theme.spacing(3)}px;
`;

const Document = styled.div`
  position: relative;
  box-shadow: ${p => p.theme.shadows[1]};
`;

const renderPage = async (
  pdf: pdfjs.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
) => {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });

  // Prepare canvas using PDF page dimensions
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  // Render PDF page into canvas context
  const renderContext = {
    canvasContext: context,
    viewport,
  };
  const renderTask = page.render(renderContext);

  await renderTask.promise;
};

const PositionPrompt: FC<Props> = ({ onChange, file, signature }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<pdfjs.PDFDocumentProxy>();
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0 });
  const onChangeCallback = useCallback(
    () => onChange(`${position.x},${position.y},${position.width},${pageNumber}`),
    [onChange, position, pageNumber],
  );
  useEffect(() => {
    let unmounted = false;
    const fileReader = new FileReader();
    const onLoad = async function (this: FileReader) {
      // TODO: Find a better way to include worker in parcel
      pdfjs.GlobalWorkerOptions.workerSrc = './pdf.worker.c654527b.js';
      const pdf = await pdfjs.getDocument(new Uint8Array(this.result as ArrayBuffer)).promise;
      if (!unmounted) {
        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);
        if (!canvasRef.current) throw new Error('Unable to get reference to canvas');
        renderPage(pdfRef.current, 1, canvasRef.current);
      }
    };
    fileReader.onload = onLoad;
    fileReader.readAsArrayBuffer(file);
    setPageNumber(1);

    return () => {
      fileReader.removeEventListener('load', onLoad);
      pdfRef.current = undefined;
      unmounted = true;
    };
  }, [file]);
  useEffect(() => {
    // Not yet ready
    if (!pdfRef.current) return;
    if (!canvasRef.current) throw new Error('Unable to get reference to canvas');
    renderPage(pdfRef.current, pageNumber, canvasRef.current);
  }, [pageNumber]);
  useEffect(() => onChangeCallback(), [pageNumber, onChangeCallback]);
  const onPositionChangeCallback = useCallback(
    (position: { x: number; y: number }, width: number) => {
      setPosition({ ...position, width });
      onChangeCallback();
    },
    [onChangeCallback],
  );
  const { t } = useTranslation();

  return (
    <Container>
      <Controls>
        <ButtonGroup
          size="small"
          variant="contained"
          color="default"
          aria-label="small contained default button group"
        >
          <Button
            onClick={() => setPageNumber(pageNumber - 1)}
            disabled={pageNumber === 1}
            aria-label={t('Previous page')}
          >
            <NavigateBeforeIcon />
          </Button>
          <Button disabled={true}>
            {pageNumber}/{totalPages}
          </Button>
          <Button
            onClick={() => setPageNumber(pageNumber + 1)}
            disabled={pageNumber === totalPages}
            aria-label={t('Next page')}
          >
            <NavigateNextIcon />
          </Button>
        </ButtonGroup>
      </Controls>
      {/*
      //@ts-ignore */}
      <Document>
        <canvas ref={canvasRef} />
        <PositionableSignature path={signature} onChange={onPositionChangeCallback} />
      </Document>
    </Container>
  );
};

export default PositionPrompt;
