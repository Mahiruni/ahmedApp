import Image from "next/image";

export function BilooLoadingVisual({
  compact = false,
  label = "Moving with BILOO",
  detail = "Connecting your next step",
}: {
  compact?: boolean;
  label?: string;
  detail?: string;
}) {
  return (
    <div className="biloo-loader" data-compact={compact}>
      <div aria-hidden="true" className="biloo-loader-stage">
        <span className="biloo-loader-orbit">
          <i />
        </span>
        <span className="biloo-loader-mark">
          <Image alt="" height={72} priority={!compact} src="/icons/biloo-mark.svg" width={72} />
        </span>
        <span className="biloo-loader-route">
          <i />
          <b />
          <i />
        </span>
      </div>
      <span className="biloo-loader-copy">
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
    </div>
  );
}
