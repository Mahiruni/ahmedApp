"use client";

import type { ActiveOrder } from "@/data/biloo";

import { Modal } from "./overlay-primitives";
import { formatETB, Icon, StatusPill } from "./ui";

export function TrackingModal({
  order,
  onClose,
  onAdvance,
}: {
  order: ActiveOrder | null;
  onClose: () => void;
  onAdvance: (order: ActiveOrder) => void;
}) {
  if (!order) return null;

  return (
    <Modal onClose={onClose} title={`Track ${order.id}`} wide>
      <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
        <div className="p-5 sm:p-6">
          <StatusPill tone="success">Live</StatusPill>
          <h2 className="mt-4 text-2xl font-black tracking-[-0.04em]">
            {order.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {order.status}
          </p>

          <div className="mt-6 rounded-2xl bg-[#f5f8fa] p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-black text-slate-500">
                Progress
              </span>
              <span className="text-xs font-black text-[#082640]">
                {order.progress}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#082640]"
                style={{ width: `${order.progress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <TrackingStep done label="Order confirmed" />
            <TrackingStep done={order.progress >= 35} label="Provider preparing" />
            <TrackingStep done={order.progress >= 60} label="Driver en route" />
            <TrackingStep done={order.progress >= 90} label="Arriving" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                ETA
              </p>
              <p className="mt-2 text-lg font-black">{order.eta}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                Total
              </p>
              <p className="mt-2 text-lg font-black">
                {formatETB(order.total)}
              </p>
            </div>
          </div>

          <button
            className="mt-5 min-h-12 w-full rounded-xl bg-[#082640] text-xs font-black text-white"
            onClick={() => onAdvance(order)}
            type="button"
          >
            Advance tracking demo
          </button>
        </div>

        <div className="relative min-h-[500px] overflow-hidden bg-[#e8eef2]">
          <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(#cbd5e1_1px,transparent_1px),linear-gradient(90deg,#cbd5e1_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="absolute left-[13%] top-[22%] h-2 w-[67%] rotate-[22deg] rounded-full bg-[#082640]/23" />
          <div className="absolute left-[17%] top-[19%] grid size-12 place-items-center rounded-full border-4 border-white bg-emerald-500 text-white shadow-xl">
            <Icon name="location" />
          </div>
          <div className="absolute right-[12%] bottom-[17%] grid size-12 place-items-center rounded-full border-4 border-white bg-rose-500 text-white shadow-xl">
            <Icon name="home" />
          </div>
          <div
            className="absolute grid size-14 place-items-center rounded-full border-4 border-white bg-[#082640] text-[#f2bd4b] shadow-2xl transition-all duration-500"
            style={{
              left: `${18 + order.progress * 0.55}%`,
              top: `${24 + order.progress * 0.28}%`,
            }}
          >
            <Icon name={order.service === "taxi" ? "taxi" : "driver"} />
          </div>
          <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/92 p-4 shadow-xl backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#f2f7fb] text-[#082640]">
                <Icon name="navigation" />
              </span>
              <div>
                <p className="text-sm font-black">Live route simulation</p>
                <p className="mt-1 text-xs text-slate-500">
                  Production tracking will stream authenticated driver GPS
                  coordinates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function TrackingStep({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid size-8 place-items-center rounded-full ${
          done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
        }`}
      >
        {done ? <Icon className="size-4" name="check" /> : "•"}
      </span>
      <span
        className={`text-sm font-black ${
          done ? "text-slate-800" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
