import React, { useEffect, useState, useRef } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';
import { IServerLink } from '@/types';

type AnalyticsModalProps = {
  linkInfo: IServerLink,
  onClose: () => void,
  opened: boolean,
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

interface ICityRow {
  city: string;
  visitors: number;
}

const AnalyticsModal = ({ opened, linkInfo, onClose }: AnalyticsModalProps): JSX.Element => {
  const theme = useTheme();
  const initiatedRef = useRef<boolean>(false);

  const [isLoadProcessing, setIsLoadProcessing] = useState<boolean>(false);
  const [totalDownloads, setTotalDownloads] = useState<number>(0);
  const [totalVisitors, setTotalVisitors] = useState<number>(0);
  const [cities, setCities] = useState<ICityRow[]>([]);

  useEffect(() => {
    if (initiatedRef.current) return;
    initiatedRef.current = true;
    getAnalyticsData();
  }, [linkInfo]);

  const getAnalyticsData = async (): Promise<void> => {
    if (isLoadProcessing) return;
    setIsLoadProcessing(true);
    try {
      const response = await fetch(
        '/api/gateway/link-analytics',
        {
          method: 'POST',
          body: JSON.stringify({ id: linkInfo.id }),
        }
      );
      const json = await response.json();
      if (json.success) {
        setTotalDownloads(json.totalDownloads ?? 0);
        setTotalVisitors(json.totalVisitors ?? 0);
        setCities(json.cities ?? []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadProcessing(false);
    }
  };

  return (
    <Dialog
      open={opened}
      onClose={onClose}
      TransitionComponent={Transition}
      sx={{
        '& .MuiPaper-root': {
          padding: '1rem 1rem 2rem',
          borderRadius: '15px',
        },
        '& .MuiDialogContent-root': {
          paddingTop: '2rem',
          paddingBottom: '2rem',
        },
        '& .MuiDialogActions-root': {
          paddingTop: '2rem',
        },
      }}
    >
      <DialogTitle variant="h5" fontWeight={500} align="center">
        Analytics
      </DialogTitle>
      <DialogContent dividers sx={{ position: 'relative' }}>
        <Box>
          <Typography>
            Name: {linkInfo.files[0]?.name || linkInfo.files[0]?.url}
          </Typography>
        </Box>
        <Box mt={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Viewed/Downloaded&nbsp;
            <Typography component="strong" fontWeight={700} color="error">{totalDownloads}</Typography>
            &nbsp;times by&nbsp;
            <Typography component="strong" fontWeight={700} color="error">{totalVisitors}</Typography>
            &nbsp;unique visitors.
          </Typography>
        </Box>
        <Box mt={2}>
          {isLoadProcessing && <LoadingSpinner />}
          <Box
            display="flex"
            flexDirection={{ xs: 'column', md: 'row' }}
            borderBottom={`1px solid ${theme.palette.common.gray}`}
            p={1}
            columnGap={2}
            bgcolor="background.level2"
          >
            <Box width={150}>
              <Typography variant="subtitle2" fontWeight={500} color="text.secondary">Location</Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight={500} color="text.secondary">Unique Visitors</Typography>
            </Box>
          </Box>
          {cities.map((item, index) => (
            <Box
              key={index}
              display="flex"
              flexDirection={{ xs: 'column', md: 'row' }}
              borderBottom={`1px solid ${theme.palette.common.gray}`}
              p={1}
              columnGap={2}
            >
              <Box width={150}>
                <Typography>{item.city}</Typography>
              </Box>
              <Box flex={1}>
                <Typography>{item.visitors}</Typography>
              </Box>
            </Box>
          ))}
          {!isLoadProcessing && cities.length === 0 && (
            <Box p={2} textAlign="center">
              <Typography color="text.secondary" variant="body2">No visitor data yet.</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsModal;
