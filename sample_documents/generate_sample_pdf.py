"""
Script to generate the standard industrial PDF report: P101_Inspection_Report.pdf
This produces a valid, multi-page PDF document without requiring external heavy dependencies.
"""
import os

def create_p101_pdf(output_path: str):
    # Minimal pure Python PDF generator for a clean 3-page industrial report
    # PDF specification compliant 3-page report
    page1_text = """
FORTRESS INDUSTRIAL PLANT - ASSET HEALTH REPORT
DOCUMENT ID: REP-2026-P101-V4
EQUIPMENT TAG: PUMP P-101 (PRIMARY FEED WATER BOOSTER)
LOCATION: SECTOR 4, TURBINE AUXILIARY BAY
DATE OF INSPECTION: AUGUST 14, 2026
LEAD INSPECTOR: MARCUS VANCE (CERTIFIED ISO 18436-2 CATEGORY III)

1. EXECUTIVE SUMMARY
A comprehensive condition monitoring and vibration analysis was conducted on Pump P-101 following reports of abnormal acoustic signatures during peak load operations. 
The main issue identified in Pump P-101 is severe mechanical vibration and advanced outer race degradation on the drive-end (DE) spherical roller bearing (SKF 22218 EK).

2. OPERATIONAL PARAMETERS RECORDED
- Operating Speed: 2,980 RPM
- Flow Rate: 420 m3/hr (Nominal: 450 m3/hr)
- Suction Pressure: 3.2 bar
- Discharge Pressure: 18.6 bar
- Motor Drive Current: 84.5 Amperes
"""

    page2_text = """
PUMP P-101 INSPECTION REPORT (CONTINUED) - PAGE 2
ASSET: P-101 FEED WATER BOOSTER PUMP

3. VIBRATION ANALYSIS & MEASUREMENTS
Overall vibration levels were measured using triaxial accelerometers mounted on non-drive-end (NDE) and drive-end (DE) bearing housings.
- Measured Overall Vibration Level (Drive-End Radial): 7.2 mm/s RMS (ISO 10816-3 Zone D: Critical/Unacceptable)
- Baseline Acceptable Vibration: 1.8 mm/s RMS
- Peak Acceleration: 4.8 g pk-pk in the 1.2 kHz - 3.5 kHz demodulated frequency spectrum.
- High amplitude peaks observed at 118.4 Hz matching the Outer Race Ball Pass Frequency (BPFO).

4. THERMOGRAPHIC FINDINGS
- Drive-end bearing housing skin temperature: 88.4 deg C (Exceeds maximum allowable limit of 70 deg C).
- Lubricant oil sample: High iron particulate concentration (142 ppm), indicating active metal-to-metal spalling.
"""

    page3_text = """
PUMP P-101 INSPECTION REPORT (CONTINUED) - PAGE 3
ASSET: P-101 FEED WATER BOOSTER PUMP

5. ROOT CAUSE ASSESSMENT
The excessive vibration and thermal runaway are caused by lubrication starvation and contamination, which resulted in micro-spalling of the drive-end bearing raceway.

6. RECOMMENDED MAINTENANCE ACTIONS
The following immediate maintenance actions are mandated:
- Action 1 (Critical): Perform an immediate scheduled shutdown of Pump P-101 within 14 days.
- Action 2: Replace drive-end bearing (SKF 22218 EK) and inspect shaft sleeve for fretting corrosion.
- Action 3: Flush the oil reservoir and replenish with ISO VG 46 synthetic lubricating oil.
- Action 4: Verify dynamic alignment between motor and pump coupling (tolerance < 0.05 mm radial runout).
- Action 5: Re-commission and perform post-maintenance vibration verification.

REPORT APPROVED BY:
H. Thorne, Head of Plant Reliability Engineering
"""

    def escape_pdf_text(text):
        return text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')

    def build_page_stream(text):
        lines = text.strip().split('\n')
        stream_cmds = ["BT", "/F1 10 Tf", "14.5 TL", "50 750 Td"]
        for line in lines:
            if line.startswith("FORTRESS") or line.startswith("PUMP P-101 INSPECTION"):
                stream_cmds.append(f"/F2 13 Tf ({escape_pdf_text(line)}) Tj T* /F1 10 Tf")
            elif line.startswith("1.") or line.startswith("2.") or line.startswith("3.") or line.startswith("4.") or line.startswith("5.") or line.startswith("6."):
                stream_cmds.append(f"T* /F2 11 Tf ({escape_pdf_text(line)}) Tj T* /F1 10 Tf")
            else:
                stream_cmds.append(f"({escape_pdf_text(line)}) Tj T*")
        stream_cmds.append("ET")
        return "\n".join(stream_cmds)

    stream1 = build_page_stream(page1_text)
    stream2 = build_page_stream(page2_text)
    stream3 = build_page_stream(page3_text)

    # Build PDF objects
    objects = []
    # 1: Catalog
    objects.append("<< /Type /Catalog /Pages 2 0 R >>")
    # 2: Pages
    objects.append("<< /Type /Pages /Kids [3 0 R 4 0 R 5 0 R] /Count 3 >>")
    # 3: Page 1
    objects.append("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 6 0 R /Resources << /Font << /F1 9 0 R /F2 10 0 R >> >> >>")
    # 4: Page 2
    objects.append("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 7 0 R /Resources << /Font << /F1 9 0 R /F2 10 0 R >> >> >>")
    # 5: Page 3
    objects.append("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 8 0 R /Resources << /Font << /F1 9 0 R /F2 10 0 R >> >> >>")
    # 6: Contents Page 1
    objects.append(f"<< /Length {len(stream1)} >>\nstream\n{stream1}\nendstream")
    # 7: Contents Page 2
    objects.append(f"<< /Length {len(stream2)} >>\nstream\n{stream2}\nendstream")
    # 8: Contents Page 3
    objects.append(f"<< /Length {len(stream3)} >>\nstream\n{stream3}\nendstream")
    # 9: Font F1 (Helvetica)
    objects.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    # 10: Font F2 (Helvetica-Bold)
    objects.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

    pdf_body = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    xref_offsets = [0]
    for i, obj in enumerate(objects):
        xref_offsets.append(len(pdf_body.encode('latin1')))
        pdf_body += f"{i+1} 0 obj\n{obj}\nendobj\n"

    xref_start = len(pdf_body.encode('latin1'))
    pdf_body += f"xref\n0 {len(objects)+1}\n0000000000 65535 f \n"
    for offset in xref_offsets[1:]:
        pdf_body += f"{offset:010d} 00000 n \n"
    pdf_body += f"trailer\n<< /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF\n"

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(pdf_body.encode('latin1'))
    print(f"Generated sample PDF at: {output_path}")

if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    target = os.path.join(out_dir, "P101_Inspection_Report.pdf")
    create_p101_pdf(target)
