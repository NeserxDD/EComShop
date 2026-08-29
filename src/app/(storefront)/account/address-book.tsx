"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { phRegions, phProvinces, phCities, phBarangays, phZip } from "@/lib/ph-address";
import { createAddress, deleteAddress, setDefaultAddress } from "@/lib/actions/address";

type Addr = {
  id: string;
  label: string;
  street: string;
  barangay: string | null;
  city: string;
  province: string;
  region: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

export function AddressBook({ initialAddresses }: { initialAddresses: Addr[] }) {
  const [region, setRegion] = useState(phRegions[0].code);
  const [province, setProvince] = useState(phProvinces[phRegions[0].code][0].code);
  const [city, setCity] = useState(phCities[phProvinces[phRegions[0].code][0].code][0].code);
  const [barangay, setBarangay] = useState(phBarangays[phCities[phProvinces[phRegions[0].code][0].code][0].code][0]);
  const [street, setStreet] = useState("");
  const [label, setLabel] = useState("Home");

  const provinces = phProvinces[region] || [];
  const cities = phCities[province] || [];
  const barangays = phBarangays[city] || [];
  const zip = phZip[city] || "";

  function onRegionChange(v: string) {
    setRegion(v);
    const provs = phProvinces[v];
    if (provs?.[0]) {
      setProvince(provs[0].code);
      const cits = phCities[provs[0].code];
      if (cits?.[0]) {
        setCity(cits[0].code);
        const brgys = phBarangays[cits[0].code];
        if (brgys?.[0]) setBarangay(brgys[0]);
      }
    }
  }
  function onProvinceChange(v: string) {
    setProvince(v);
    const cits = phCities[v];
    if (cits?.[0]) {
      setCity(cits[0].code);
      const brgys = phBarangays[cits[0].code];
      if (brgys?.[0]) setBarangay(brgys[0]);
    }
  }
  function onCityChange(v: string) {
    setCity(v);
    const brgys = phBarangays[v];
    if (brgys?.[0]) setBarangay(brgys[0]);
  }

  const regionName = phRegions.find((r) => r.code === region)?.name || region;
  const provinceName = provinces.find((p) => p.code === province)?.name || province;
  const cityName = cities.find((c) => c.code === city)?.name || city;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
      <div>
        <h2 className="font-medium" style={{ fontFamily: "var(--font-inter)" }}>
          Addresses — Home / Work
        </h2>
        <p className="text-xs text-muted-foreground">Tap Region → Province → City → Barangay, then Street + ZIP. Saved as Home/Work for Checkout.</p>
      </div>

      {initialAddresses.length > 0 ? (
        <div className="space-y-2">
          {initialAddresses.map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-card p-3 flex flex-wrap justify-between gap-2">
              <div>
                <p className="text-sm font-medium">
                  {a.label} {a.isDefault && <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">Default</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {a.street}, {a.barangay ? `${a.barangay}, ` : ""}{a.city}, {a.province}, {a.region} {a.zip} {a.country}
                </p>
              </div>
              <div className="flex gap-1">
                {!a.isDefault && (
                  <form action={setDefaultAddress}>
                    <input type="hidden" name="id" value={a.id} />
                    <Button size="sm" variant="outline" type="submit">
                      Default
                    </Button>
                  </form>
                )}
                <form action={deleteAddress}>
                  <input type="hidden" name="id" value={a.id} />
                  <Button size="sm" variant="ghost" type="submit">
                    Delete
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No addresses yet — add Home or Work below.</p>
      )}

      <form action={createAddress} className="rounded-xl border border-dashed border-border p-3 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <select value={label} onChange={(e) => setLabel(e.target.value)} name="label" className="rounded-xl border border-border bg-card px-3 py-2 text-sm">
            <option value="Home">Home</option>
            <option value="Work">Work</option>
          </select>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" name="isDefault" /> Default
          </label>
        </div>

        <div className="grid gap-2">
          <select value={region} onChange={(e) => onRegionChange(e.target.value)} className="rounded-xl border border-border bg-card px-3 py-2 text-sm">
            {phRegions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
          <input type="hidden" name="region" value={regionName} />

          <select value={province} onChange={(e) => onProvinceChange(e.target.value)} className="rounded-xl border border-border bg-card px-3 py-2 text-sm">
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
          <input type="hidden" name="province" value={provinceName} />

          <select value={city} onChange={(e) => onCityChange(e.target.value)} className="rounded-xl border border-border bg-card px-3 py-2 text-sm">
            {cities.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <input type="hidden" name="city" value={cityName} />

          <select value={barangay} onChange={(e) => setBarangay(e.target.value)} className="rounded-xl border border-border bg-card px-3 py-2 text-sm">
            {barangays.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <input type="hidden" name="barangay" value={barangay} />

          <input name="street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Street / House No. (e.g., Blk 3 Lot 5 San Jose St.)" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
          <input type="hidden" name="zip" value={zip} />
          <input name="zip" value={zip} readOnly placeholder="ZIP auto-filled" className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm text-muted-foreground" />
          <input type="hidden" name="country" value="PH" />
        </div>

        <Button type="submit" className="w-full">
          Save address
        </Button>
        <p className="text-xs text-muted-foreground">DB saves Region/Province/City/Barangay/Street/ZIP as plain text — not bad, just 1 row per address (Home + Work = 2 rows).</p>
      </form>
    </div>
  );
}
