import type { RefetchOptions, QueryObserverResult } from '@tanstack/react-query';

import { useState } from 'react';
import BigNumber from 'bignumber.js';
import { SessionKeyGuard, useTransferCoin } from '@roochnetwork/rooch-sdk-kit';
import {
  isValidAddress,
  type BalanceInfoView,
  type PaginatedBalanceInfoViews,
} from '@roochnetwork/rooch-sdk';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Button,
  Dialog,
  TextField,
  Typography,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
  FormHelperText,
  InputAdornment,
} from '@mui/material';

import { formatCoin } from 'src/utils/format-number';

import { toast } from 'src/components/snackbar';

export default function CoinTransferModal({
  open,
  onClose,
  selectedRow,
  refetch,
}: {
  open: boolean;
  onClose: () => void;
  selectedRow: BalanceInfoView;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<PaginatedBalanceInfoViews, Error>>;
}) {
  const { mutateAsync: transferCoin, isError } = useTransferCoin();
  const [transferValue, setTransferValue] = useState('');
  const [recipient, setRecipient] = useState('');

  const [transferring, setTransferring] = useState(false);

  const recipientIsValid = () => {
    if (recipient === '') {
      return false;
    }
    return isValidAddress(recipient);
  };

  const handleTransfer = () => {
    const s = recipientIsValid();
    console.log(s);
    setTransferring(true);
    const amountNumber = new BigNumber(transferValue)
      .multipliedBy(new BigNumber(10).pow(selectedRow.decimals))
      .integerValue(BigNumber.ROUND_FLOOR)
      .toNumber();
    transferCoin({
      recipient,
      amount: amountNumber,
      coinType: {
        target: selectedRow.coin_type,
      },
    })
      .then((result) => {
        console.log(isError);
        onClose();
        refetch();
        toast.success('Transfer success');
      })
      .finally(() => {
        setTransferring(false);
      });
  };

  return (
    <Dialog open={open}>
      <DialogTitle sx={{ pb: 2 }}>Coin Transfer</DialogTitle>

      <DialogContent
        sx={{
          width: '480px',
          overflow: 'unset',
        }}
      >
        <Stack
          direction="row"
          className="mb-2 w-full"
          justifyContent="space-between"
          alignItems="flex-end"
        >
          <Stack>
            <Typography className="!font-semibold">{selectedRow.symbol}</Typography>
            <Typography className="text-gray-400 !text-xs">{selectedRow.name}</Typography>
          </Stack>
          <Stack>
            <Typography className="text-gray-600 !text-sm !font-semibold">
              Balance:{' '}
              {formatCoin(Number(selectedRow.balance), selectedRow.decimals, selectedRow.decimals)}
            </Typography>
          </Stack>
        </Stack>
        <Stack justifyContent="center" spacing={2} direction="column" sx={{ pt: 1 }}>
          <FormControl>
            <TextField
              label="Amount"
              placeholder=""
              value={transferValue}
              inputMode="decimal"
              autoComplete="off"
              onChange={(e) => {
                setTransferValue(e.target.value);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setTransferValue(
                            new BigNumber(
                              formatCoin(
                                Number(selectedRow.balance),
                                selectedRow.decimals,
                                selectedRow.decimals
                              )
                            )
                              .div(2)
                              .toString()
                          );
                        }}
                      >
                        Half
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setTransferValue(
                            new BigNumber(
                              formatCoin(
                                Number(selectedRow.balance),
                                selectedRow.decimals,
                                selectedRow.decimals
                              )
                            ).toString()
                          );
                        }}
                      >
                        Max
                      </Button>
                    </Stack>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <FormControl>
            <TextField
              label="Recipient"
              inputMode="text"
              spellCheck="false"
              rows={2}
              multiline
              autoComplete="off"
              InputProps={{
                spellCheck: 'false',
              }}
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
              }}
            />
          </FormControl>
        </Stack>

        {false && (
          <FormHelperText error sx={{ px: 2 }}>
            invalid value
          </FormHelperText>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={() => {
            onClose();
          }}
        >
          Cancel
        </Button>

        <SessionKeyGuard onClick={handleTransfer}>
          <LoadingButton
            fullWidth
            loading={transferring}
            disabled={transferValue === '' || !recipientIsValid()}
            variant="contained"
          >
            Confirm
          </LoadingButton>
        </SessionKeyGuard>
      </DialogActions>
    </Dialog>
  );
}
