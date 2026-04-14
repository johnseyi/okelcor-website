"use client";

import { useState, useMemo } from "react";

// ─── Vehicle presets ──────────────────────────────────────────────────────────

type Mode = "km" | "hours";

type Vehicle = {
  label: string;
  fetCost: number;
  defaultConsumption: number;
  defaultDistance: number;
  mode: Mode;
};

const VEHICLES: Vehicle[] = [
  { label: "Passenger Car",           fetCost: 299, defaultConsumption: 7,   defaultDistance: 15000, mode: "km"    },
  { label: "Van / Light Commercial",  fetCost: 399, defaultConsumption: 10,  defaultDistance: 30000, mode: "km"    },
  { label: "Heavy Truck / Fleet",     fetCost: 599, defaultConsumption: 28,  defaultDistance: 80000, mode: "km"    },
  { label: "Agricultural Machinery",  fetCost: 699, defaultConsumption: 12,  defaultDistance: 1200,  mode: "hours" },
  { label: "Construction Equipment",  fetCost: 699, defaultConsumption: 15,  defaultDistance: 1500,  mode: "hours" },
  { label: "Marine",                  fetCost: 599, defaultConsumption: 20,  defaultDistance: 800,   mode: "hours" },
];

// ─── Input styles ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-[10px] border border-white/[0.12] bg-white/[0.07] px-4 py-3 text-[0.93rem] text-white outline-none placeholder:text-white/30 transition focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20";

const labelCls = "mb-1.5 block text-[0.78rem] font-semibold uppercase tracking-wider text-white/50";

// ─── Calculator ───────────────────────────────────────────────────────────────

export default function AmortizationCalculator() {
  const [vehicleIdx, setVehicleIdx]     = useState(0);
  const [consumption, setConsumption]   = useState(VEHICLES[0].defaultConsumption.toString());
  const [distance, setDistance]         = useState(VEHICLES[0].defaultDistance.toString());
  const [fuelPrice, setFuelPrice]       = useState("1.65");
  const [savingsPct, setSavingsPct]     = useState(10);

  const vehicle = VEHICLES[vehicleIdx];

  const handleVehicleChange = (idx: number) => {
    const v = VEHICLES[idx];
    setVehicleIdx(idx);
    setConsumption(v.defaultConsumption.toString());
    setDistance(v.defaultDistance.toString());
  };

  // ── Calculations ────────────────────────────────────────────────────────────

  const results = useMemo(() => {
    const cons   = parseFloat(consumption) || 0;
    const dist   = parseFloat(distance)    || 0;
    const price  = parseFloat(fuelPrice)   || 0;
    const pct    = savingsPct / 100;

    // Annual fuel litres
    const annualLitres =
      vehicle.mode === "km"
        ? (cons / 100) * dist   // l/100km × km
        : cons * dist;          // l/h × hours

    const annualFuelCost   = annualLitres * price;
    const annualSavings    = annualFuelCost * pct;
    const costWithFet      = annualFuelCost - annualSavings + vehicle.fetCost;
    const paybackMonths    = annualSavings > 0 ? (vehicle.fetCost / annualSavings) * 12 : null;

    return { annualFuelCost, annualSavings, costWithFet, paybackMonths };
  }, [consumption, distance, fuelPrice, savingsPct, vehicle]);

  const fmt = (n: number) =>
    n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="rounded-[22px] bg-white/[0.04] p-6 ring-1 ring-white/[0.08] sm:p-8">

      {/* Vehicle selector */}
      <div className="mb-6">
        <label className={labelCls}>Vehicle Type</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {VEHICLES.map((v, i) => (
            <button
              key={v.label}
              type="button"
              onClick={() => handleVehicleChange(i)}
              className={[
                "rounded-[10px] border px-3 py-2.5 text-left text-[0.78rem] font-semibold transition",
                vehicleIdx === i
                  ? "border-[#10b981] bg-[#10b981]/10 text-[#10b981]"
                  : "border-white/10 bg-white/[0.04] text-white/60 hover:border-white/20 hover:text-white/80",
              ].join(" ")}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>
            Fuel Consumption ({vehicle.mode === "km" ? "L/100km" : "L/h"})
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={consumption}
            onChange={(e) => setConsumption(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>
            {vehicle.mode === "km" ? "Annual Kilometres" : "Annual Operating Hours"}
          </label>
          <input
            type="number"
            min="0"
            step="100"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Fuel Price (€/L)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={fuelPrice}
            onChange={(e) => setFuelPrice(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>FET Device Cost (€) — pre-set for vehicle type</label>
          <input
            type="text"
            readOnly
            value={`€${vehicle.fetCost}`}
            className={`${inputCls} cursor-default opacity-60`}
          />
        </div>
      </div>

      {/* Savings slider */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <label className={labelCls + " mb-0"}>Expected Fuel Savings</label>
          <span className="text-[1rem] font-extrabold text-[#10b981]">{savingsPct}%</span>
        </div>
        <input
          type="range"
          min="8"
          max="15"
          step="1"
          value={savingsPct}
          onChange={(e) => setSavingsPct(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#10b981]"
        />
        <div className="mt-1 flex justify-between text-[0.72rem] text-white/30">
          <span>Conservative 8%</span>
          <span>Optimistic 15%</span>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[14px] bg-white/[0.06] p-4 text-center">
          <p className="text-[0.72rem] font-bold uppercase tracking-wider text-white/40">Annual Fuel Cost</p>
          <p className="mt-1.5 text-[1.4rem] font-extrabold text-white">
            €{fmt(results.annualFuelCost)}
          </p>
          <p className="mt-0.5 text-[0.72rem] text-white/40">Without FET</p>
        </div>

        <div className="rounded-[14px] bg-[#10b981]/10 p-4 text-center ring-1 ring-[#10b981]/30">
          <p className="text-[0.72rem] font-bold uppercase tracking-wider text-[#10b981]/70">Annual Savings</p>
          <p className="mt-1.5 text-[1.4rem] font-extrabold text-[#10b981]">
            €{fmt(results.annualSavings)}
          </p>
          <p className="mt-0.5 text-[0.72rem] text-[#10b981]/60">Per year with FET</p>
        </div>

        <div className="rounded-[14px] bg-white/[0.06] p-4 text-center">
          <p className="text-[0.72rem] font-bold uppercase tracking-wider text-white/40">Payback Period</p>
          <p className="mt-1.5 text-[1.4rem] font-extrabold text-white">
            {results.paybackMonths !== null
              ? results.paybackMonths < 12
                ? `${Math.ceil(results.paybackMonths)} mo`
                : `${(results.paybackMonths / 12).toFixed(1)} yr`
              : "—"}
          </p>
          <p className="mt-0.5 text-[0.72rem] text-white/40">Time to break even</p>
        </div>
      </div>

      <p className="mt-4 text-center text-[0.72rem] leading-5 text-white/25">
        Estimates based on field and lab test data. Actual savings vary by vehicle condition, driving pattern, and fuel quality.
      </p>
    </div>
  );
}
