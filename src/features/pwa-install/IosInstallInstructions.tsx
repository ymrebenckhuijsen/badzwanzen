interface IosInstallInstructionsProps {
  onClose: () => void
}

export function IosInstallInstructions({ onClose }: IosInstallInstructionsProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-t-xl bg-surface-container p-6 pb-8 text-on-surface">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-headline-lg-mobile text-on-surface">
            Installeren op iPhone
          </h2>
          <button
            type="button"
            aria-label="Sluiten"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-xl leading-none text-on-surface-variant"
          >
            ×
          </button>
        </div>

        <ol className="flex flex-col gap-3 font-body text-body-md text-on-surface-variant">
          <li className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              1
            </span>
            <span>Tik op het deel-icoon onderin Safari</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              2
            </span>
            <span>Kies "Zet op beginscherm"</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              3
            </span>
            <span>Tik op "Voeg toe"</span>
          </li>
        </ol>
      </div>
    </div>
  )
}
