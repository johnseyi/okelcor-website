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
  "w-full rounded-[10px] border border-[#e2e8e2] bg-white px-4 py-3 text-[0.93rem] text-[#111111] outline-none placeholder:text-[#9ca3af] transition focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20";

const labelCls = "mb-1.5 block text-[0.78rem] font-semibold uppercase tracking-wider text-[#6b7280]";

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

    const annualLitres =
      vehicle.mode === "km"
        ? (cons / 100) * dist
        : cons * dist;

    const annualFuelCost   = annualLitres * price;
    const annualSavings    = annualFuelCost * pct;
    const costWithFet      = annualFuelCost - annualSavings + vehicle.fetCost;
    const paybackMonths    = annualSavings > 0 ? (vehicle.fetCost / annualSavings) * 12 : null;

    return { annualFuelCost, annualSavings, costWithFet, paybackMonths };
  }, [consumption, distance, fuelPrice, savingsPct, vehicle]);

  const fmt = (n: number) =>
    n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="rounded-[22px] border border-[#e2e8e2] bg-white p-6 shadow-sm sm:p-8">

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
                  ? "border-[#22c55e] bg-[#dcfce7] text-[#166534]"
                  : "border-[#e2e8e2] bg-white text-[#6b7280] hover:border-[#22c55e]/40 hover:text-[#111111]",
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
          <span className="text-[1rem] font-extrabold text-[#22c55e]">{savingsPct}%</span>
        </div>
        <input
          type="range"
          min="8"
          max="15"
          step="1"
          value={savingsPct}
          onChange={(e) => setSavingsPct(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#e2e8e2] accent-[#22c55e]"
        />
        <div className="mt-1 flex justify-between text-[0.72rem] text-[#9ca3af]">
          <span>Conservative 8%</span>
          <span>Optimistic 15%</span>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[14px] border border-[#e2e8e2] bg-[#f9fafb] p-4 text-center">
          <p className="text-[0.72rem] font-bold uppercase tracking-wider text-[#6b7280]">Annual Fuel Cost</p>
          <p className="mt-1.5 text-[1.4rem] font-extrabold text-[#111111]">
            €{fmt(results.annualFuelCost)}
          </p>
          <p className="mt-0.5 text-[0.72rem] text-[#9ca3af]">Without FET</p>
        </div>

        <div className="rounded-[14px] border border-[#22c55e]/30 bg-[#dcfce7] p-4 text-center">
          <p className="text-[0.72rem] font-bold uppercase tracking-wider text-[#166534]">Annual Savings</p>
          <p className="mt-1.5 text-[1.4rem] font-extrabold text-[#16a34a]">
            €{fmt(results.annualSavings)}
          </p>
          <p className="mt-0.5 text-[0.72rem] text-[#166534]/70">Per year with FET</p>
        </div>

        <div className="rounded-[14px] border border-[#e2e8e2] bg-[#f9fafb] p-4 text-center">
          <p className="text-[0.72rem] font-bold uppercase tracking-wider text-[#6b7280]">Payback Period</p>
          <p className="mt-1.5 text-[1.4rem] font-extrabold text-[#111111]">
            {results.paybackMonths !== null
              ? results.paybackMonths < 12
                ? `${Math.ceil(results.paybackMonths)} mo`
                : `${(results.paybackMonths / 12).toFixed(1)} yr`
              : "—"}
          </p>
          <p className="mt-0.5 text-[0.72rem] text-[#9ca3af]">Time to break even</p>
        </div>
      </div>

      <p className="mt-4 text-center text-[0.72rem] leading-5 text-[#9ca3af]">
        Estimates based on field and lab test data. Actual savings vary by vehicle condition, driving pattern, and fuel quality.
      </p>
    </div>
  );
}
