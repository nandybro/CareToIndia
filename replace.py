import os
import re

with open('index.html', 'r') as f:
    content = f.read()

replacements = [
    ('Cancer Treatment', 'Medical Treatment'),
    ('cancer treatment', 'medical treatment'),
    ('cancer patients', 'patients'),
    ('oncology treatment', 'medical treatment'),
    ('oncologists', 'doctors'),
    ('oncologist', 'doctor'),
    ('oncology care', 'medical care'),
    ('cancer care', 'medical care'),
    ('Fight Cancer', 'Fight the Bill'),
    ('Fight cancer', 'Fight high medical bills'),
    ('cancer type', 'condition'),
    ('Type of Cancer', 'Type of Treatment'),
    ('cancer-type', 'treatment-type'),
    ('<option>Breast Cancer</option>', '<option>Oncology / Cancer Treatment</option>'),
    ('<option>Prostate Cancer</option>', '<option>Cardiac Surgery</option>'),
    ('<option>Lung Cancer</option>', '<option>Orthopedics / Joint Replacement</option>'),
    ('<option>Blood Cancer / Leukemia</option>', '<option>Organ Transplant</option>'),
    ('<option>Bone Marrow Transplant</option>', '<option>Spine Surgery</option>'),
    ('<option>Brain Tumor</option>', '<option>Bariatric Surgery</option>'),
    ('<option>Colorectal Cancer</option>', '<option>Dental Implants / Surgery</option>'),
    ('A single round of chemotherapy in the US can cost <strong>$30,000–$100,000</strong>.', 'A complex surgery or prolonged treatment in the US can cost <strong>$30,000–$150,000+</strong>.'),
    ('          Immunotherapy reaches <strong>$150,000+ per year</strong>.\n', ''),
    ('same radiotherapy machines', 'same advanced medical technology'),
    ('expert oncology opinion', 'expert medical opinion'),
    ('badge-oncol', 'badge-doctor'),
    ('Board-Certified Oncologists', 'Board-Certified Specialists'),
    ('per cancer treatment cycle', 'for major procedures'),
    ('State-of-the-art oncology radiation therapy equipment in India', 'State-of-the-art medical equipment in India'),
    ('cancer%20treatment', 'medical%20treatment'),
    ('<span>Prostate Cancer — Houston, Texas</span>', '<span>Cardiac Surgery — Houston, Texas</span>'),
    ('<span>Breast Cancer — Chicago, Illinois</span>', '<span>Orthopedic Surgery — Chicago, Illinois</span>'),
    ('<span>Blood Cancer (BMT) — Phoenix, Arizona</span>', '<span>Organ Transplant — Phoenix, Arizona</span>'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Special case for the testimonials
content = content.replace('stage 3 breast cancer', 'a complex joint replacement')
content = content.replace('during chemo', 'during recovery')
content = content.replace("I'm now in remission", "I'm now walking pain-free")
content = content.replace('My doctor in the US recommended a bone marrow transplant', 'My specialist in the US recommended a complex transplant')
content = content.replace('My doctor in the US recommended a complex transplant', 'My specialist in the US recommended a complex transplant')

with open('index.html', 'w') as f:
    f.write(content)

with open('script.js', 'r') as f:
    script_content = f.read()

script_content = script_content.replace('cancerType', 'treatmentType')
script_content = script_content.replace('cancer-type', 'treatment-type')
script_content = script_content.replace('cancer_type', 'treatment_type')
script_content = script_content.replace('cancer care', 'medical care')

with open('script.js', 'w') as f:
    f.write(script_content)
    
with open('google_apps_script.gs', 'r') as f:
    gas_content = f.read()
    
gas_content = gas_content.replace('Cancer Type', 'Treatment Type')
gas_content = gas_content.replace('cancerType', 'treatmentType')

with open('google_apps_script.gs', 'w') as f:
    f.write(gas_content)

