"""Rebuild the salary chart from the archived official XLSX and percentage data.

Uses only Python's standard library. Run: python scripts/build_salary_data.py
"""

from pathlib import Path
import hashlib
import json
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parent.parent
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def numeric_cells(path):
    with zipfile.ZipFile(ROOT / path) as workbook:
        sheet = ET.fromstring(workbook.read("xl/worksheets/sheet1.xml"))
        return {
            cell.get("r"): float(value.text)
            for cell in sheet.findall(".//m:sheetData/m:row/m:c", NS)
            if cell.get("t") != "s" and (value := cell.find("m:v", NS)) is not None
        }


def sha256(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


data = json.loads((ROOT / "data/salary-distribution.json").read_text())
cells = numeric_cells(data["rawFile"])
data["deciles"] = [
    {"percentile": (i + 1) * 10, "annualTwd": round(cells[f"{column}16"] * 10000),
     "sourceColumn": 4 + i * 2}
    for i, column in enumerate("DFHJLNPRT")
]
data["sha256"] = sha256(data["rawFile"])
summary = data["summary"]
cells = numeric_cells(summary["rawFile"])
summary.update(meanAnnualTwd=round(cells["V16"] * 10000),
               medianAnnualTwd=round(cells["K16"] * 10000), belowMeanPercent=cells["U16"])
summary["sha256"] = sha256(summary["rawFile"])

frequency = data["frequency"]
raw = json.loads((ROOT / frequency["rawFile"]).read_text())
assert raw["year"] == 113 and raw["groupRangeTSIndex"] == 0
points = {point["index"]: point["percent"] for point in raw["points"]}
assert set(points) == set(range(2, 81))
assert "845萬7千人" in (ROOT / frequency["populationRawFile"]).read_text()
assert frequency["population"] == 8457000
bins = []
for lower in range(0, 2000000, 100000):
    upper = lower + 100000
    percent = points[2] if lower == 0 else points[upper // 50000 - 1] + points[upper // 50000]
    bins.append({"lower": lower, "upper": upper, "percent": round(percent, 8),
                 "estimatedCount": round(percent * frequency["population"] / 100)})
tail = round(100 - sum(item["percent"] for item in bins), 8)
assert 0 < tail < 100
bins.append({"lower": 2000000, "upper": None, "percent": tail,
             "estimatedCount": round(tail * frequency["population"] / 100)})
frequency.update(bins=bins, sha256=sha256(frequency["rawFile"]),
                 populationSha256=sha256(frequency["populationRawFile"]))
for path in ["data/salary-distribution.json", "public/data/salary-distribution.json"]:
    (ROOT / path).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
print("Rebuilt salary chart: XLSX mean/median/deciles and 21 estimated employee-count bands.")
