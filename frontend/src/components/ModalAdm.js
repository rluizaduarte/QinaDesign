"use client";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { alpha } from "@mui/material/styles";

const LARGURA_PADRAO = 550;

export default function ModalAdm({
  aberto,
  onFechar,
  largura = LARGURA_PADRAO,
  minHeight,
  ariaLabelledBy,
  children,
}) {
  return (
    <Dialog
      open={aberto}
      onClose={onFechar}
      aria-labelledby={ariaLabelledBy}
      slotProps={{
        paper: {
          sx: {
            width: largura,
            maxWidth: "calc(100% - 32px)",
            minHeight,
            maxHeight: "calc(100% - 32px)",
            m: 2,
            borderRadius: "4px",
            bgcolor: "background.default",
            backgroundImage: "none",
          },
        },
        backdrop: {
          sx: { bgcolor: (theme) => alpha(theme.palette.primary.dark, 0.55) },
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: "40px 48px" } }}>
        {children}
      </DialogContent>
    </Dialog>
  );
}
