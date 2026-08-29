// Simple PSGC-like data for portfolio demo — 3 regions, enough to show Region→Province→City→Barangay flow
// For production, replace with full https://psgc.gitlab.io/api/ or https://github.com/isaacdarcilla/philippine-addresses

export const phRegions = [
  { code: "NCR", name: "National Capital Region (NCR)" },
  { code: "04A", name: "CALABARZON (Region IV-A)" },
  { code: "07", name: "Central Visayas (Region VII)" },
];

export const phProvinces: Record<string, { code: string; name: string }[]> = {
  NCR: [
    { code: "1339", name: "City of Manila" },
    { code: "1376", name: "Quezon City" },
    { code: "1374", name: "City of Makati" },
  ],
  "04A": [
    { code: "0421", name: "Cavite" },
    { code: "0434", name: "Laguna" },
    { code: "0408", name: "Batangas" },
  ],
  "07": [
    { code: "0722", name: "Cebu" },
    { code: "0712", name: "Bohol" },
    { code: "0720", name: "Cebu City (Highly Urbanized)" },
  ],
};

export const phCities: Record<string, { code: string; name: string }[]> = {
  "1339": [{ code: "133901", name: "Manila City" }],
  "1376": [{ code: "137606", name: "Quezon City" }],
  "1374": [{ code: "137404", name: "Makati City" }],
  "0421": [
    { code: "042108", name: "Dasmariñas" },
    { code: "042106", name: "Bacoor" },
  ],
  "0434": [
    { code: "043404", name: "Calamba" },
    { code: "043405", name: "Santa Rosa" },
  ],
  "0408": [{ code: "040805", name: "Batangas City" }],
  "0722": [{ code: "072231", name: "Lapu-Lapu City" }],
  "0712": [{ code: "071246", name: "Tagbilaran City" }],
  "0720": [{ code: "072001", name: "Cebu City" }],
};

export const phBarangays: Record<string, string[]> = {
  "133901": ["Barangay 1", "Barangay 2", "Ermita"],
  "137606": ["Barangay Commonwealth", "Barangay Batasan Hills"],
  "137404": ["Barangay Poblacion", "Barangay San Lorenzo"],
  "042108": ["Barangay San Jose", "Barangay San Agustin"],
  "042106": ["Barangay Molino", "Barangay Habay"],
  "043404": ["Barangay Real", "Barangay Halang"],
  "043405": ["Barangay Balibago", "Barangay Dita"],
  "040805": ["Barangay Alangilan", "Barangay Balagtas"],
  "072231": ["Barangay Pajo", "Barangay Pusok"],
  "071246": ["Barangay Cogon", "Barangay Dampas"],
  "072001": ["Barangay Lahug", "Barangay Mabolo"],
};

export const phZip: Record<string, string> = {
  "133901": "1000",
  "137606": "1100",
  "137404": "1200",
  "042108": "4114",
  "042106": "4102",
  "043404": "4027",
  "043405": "4026",
  "040805": "4200",
  "072231": "6015",
  "071246": "6300",
  "072001": "6000",
};
