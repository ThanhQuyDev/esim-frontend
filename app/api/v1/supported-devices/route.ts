import { NextResponse } from "next/server";

// Mock data for supported devices
const mockData = {
  data: [
    {
      type: "Smartphones",
      manufacturers: [
        {
          manufacturer: "iPhone",
          devices: [
            { id: "1", device: "iPhone 17 Pro Max" },
            { id: "2", device: "iPhone 17 Pro" },
            { id: "3", device: "iPhone 17 Air" },
            { id: "4", device: "iPhone 17" },
            { id: "5", device: "iPhone 16e" },
            { id: "6", device: "iPhone 16 Pro Max" },
            { id: "7", device: "iPhone 16 Plus" },
            { id: "8", device: "iPhone 16 Pro" },
            { id: "9", device: "iPhone 16" },
            { id: "10", device: "iPhone 15 Pro Max" },
            { id: "11", device: "iPhone 15 Plus" },
            { id: "12", device: "iPhone 15 Pro" },
            { id: "13", device: "iPhone 15" },
            { id: "14", device: "iPhone 14 Pro Max" },
            { id: "15", device: "iPhone 14 Plus" },
            { id: "16", device: "iPhone 14 Pro" },
            { id: "17", device: "iPhone 14" },
            { id: "18", device: "iPhone SE 3 (2022)" },
            { id: "19", device: "iPhone 13 Pro Max" },
            { id: "20", device: "iPhone 13 Pro" },
            { id: "21", device: "iPhone 13 Mini" },
            { id: "22", device: "iPhone 13" },
            { id: "23", device: "iPhone 12 Pro Max" },
            { id: "24", device: "iPhone 12 Pro" },
            { id: "25", device: "iPhone 12 Mini" },
            { id: "26", device: "iPhone 12" },
            { id: "27", device: "iPhone SE 2 (2020)" },
            { id: "28", device: "iPhone 11 Pro Max" },
            { id: "29", device: "iPhone 11 Pro" },
            { id: "30", device: "iPhone 11" },
            { id: "31", device: "iPhone XS Max" },
            { id: "32", device: "iPhone XS" },
            { id: "33", device: "iPhone XR" },
          ],
        },
        {
          manufacturer: "Samsung",
          devices: [
            { id: "34", device: "Samsung Galaxy Z TriFold" },
            { id: "35", device: "Samsung Galaxy A17" },
            { id: "36", device: "Samsung Galaxy XCover7 Pro" },
            { id: "37", device: "Samsung Galaxy A56" },
            { id: "38", device: "Samsung Galaxy A55 5G" },
            { id: "39", device: "Samsung Galaxy A54 5G" },
            { id: "40", device: "Samsung Galaxy S25" },
            { id: "41", device: "Samsung Galaxy S25 Ultra" },
            { id: "42", device: "Samsung Galaxy S24 Ultra" },
            { id: "43", device: "Samsung Galaxy S24+" },
            { id: "44", device: "Samsung Galaxy S24" },
            { id: "45", device: "Samsung Galaxy S23 Ultra" },
            { id: "46", device: "Samsung Galaxy Z Flip6" },
            { id: "47", device: "Samsung Galaxy Z Fold6" },
          ],
        },
        {
          manufacturer: "Google",
          devices: [
            { id: "48", device: "Google Pixel 10 Pro" },
            { id: "49", device: "Google Pixel 10" },
            { id: "50", device: "Google Pixel 9 Pro Fold" },
            { id: "51", device: "Google Pixel 9 Pro XL" },
            { id: "52", device: "Google Pixel 9 Pro" },
            { id: "53", device: "Google Pixel 9" },
            { id: "54", device: "Google Pixel 9a" },
            { id: "55", device: "Google Pixel 8 Pro" },
            { id: "56", device: "Google Pixel 8" },
            { id: "57", device: "Google Pixel 8a" },
            { id: "58", device: "Google Pixel 7 Pro" },
            { id: "59", device: "Google Pixel 7" },
            { id: "60", device: "Google Pixel 7a" },
          ],
        },
      ],
    },
    {
      type: "Smartwatches",
      manufacturers: [
        {
          manufacturer: "Apple",
          devices: [
            { id: "61", device: "Apple Watch Series 9" },
            { id: "62", device: "Apple Watch Series 8" },
            { id: "63", device: "Apple Watch Series 7" },
            { id: "64", device: "Apple Watch Ultra 2" },
            { id: "65", device: "Apple Watch Ultra" },
            { id: "66", device: "Apple Watch SE (2nd gen)" },
          ],
        },
        {
          manufacturer: "Samsung",
          devices: [
            { id: "67", device: "Samsung Galaxy Watch 6" },
            { id: "68", device: "Samsung Galaxy Watch 5" },
            { id: "69", device: "Samsung Galaxy Watch 4" },
          ],
        },
      ],
    },
    {
      type: "Tablets",
      manufacturers: [
        {
          manufacturer: "Apple",
          devices: [
            { id: "70", device: "iPad Pro 12.9-inch (3rd gen and later)" },
            { id: "71", device: "iPad Pro 11-inch (all models)" },
            { id: "72", device: "iPad Air (3rd gen and later)" },
            { id: "73", device: "iPad (7th gen and later)" },
            { id: "74", device: "iPad Mini (5th gen and later)" },
          ],
        },
        {
          manufacturer: "Samsung",
          devices: [
            { id: "75", device: "Samsung Galaxy Tab S9" },
            { id: "76", device: "Samsung Galaxy Tab S8" },
            { id: "77", device: "Samsung Galaxy Tab S7" },
          ],
        },
      ],
    },
    {
      type: "Laptops",
      manufacturers: [
        {
          manufacturer: "Microsoft",
          devices: [
            { id: "78", device: "Surface Pro 9 with 5G" },
            { id: "79", device: "Surface Pro X" },
            { id: "80", device: "Surface Go 3" },
          ],
        },
        {
          manufacturer: "Lenovo",
          devices: [
            { id: "81", device: "Lenovo ThinkPad X1 Carbon Gen 11" },
            { id: "82", device: "Lenovo Yoga 9i" },
          ],
        },
      ],
    },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  let filteredData = mockData;

  // Filter by search query if provided
  if (search) {
    const searchLower = search.toLowerCase();
    filteredData = {
      data: mockData.data
        .map((deviceType) => ({
          ...deviceType,
          manufacturers: deviceType.manufacturers
            .map((manufacturer) => ({
              ...manufacturer,
              devices: manufacturer.devices.filter((device) =>
                device.device.toLowerCase().includes(searchLower)
              ),
            }))
            .filter((manufacturer) => manufacturer.devices.length > 0),
        }))
        .filter((deviceType) => deviceType.manufacturers.length > 0),
    };
  }

  return NextResponse.json(filteredData);
}
