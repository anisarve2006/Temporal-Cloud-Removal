import os
import re

button_re = re.compile(r'<button\b([^>]*)>(.*?)</button>', re.DOTALL)
select_re = re.compile(r'<select\b([^>]*)>(.*?)</select>', re.DOTALL)
input_re = re.compile(r'<input\b([^>]*)>', re.DOTALL)
a_re = re.compile(r'<a\b([^>]*)>(.*?)</a>', re.DOTALL)

for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith(('.jsx', '.js')):
            fp = os.path.join(root, f)
            with open(fp, 'r', encoding='utf-8', errors='ignore') as fh:
                content = fh.read()
                
                # Check buttons without onClick
                for m in re.finditer(r'<button\b([^>]*)>', content):
                    attrs = m.group(1)
                    if 'onClick' not in attrs and 'type="submit"' not in attrs:
                        # Find line number
                        line_no = content[:m.start()].count('\n') + 1
                        snippet = content[m.start():m.start()+80].replace('\n', ' ')
                        print(f"{fp}:{line_no} [BUTTON_NO_ONCLICK] {snippet}")

                # Check selects without onChange
                for m in re.finditer(r'<select\b([^>]*)>', content):
                    attrs = m.group(1)
                    if 'onChange' not in attrs:
                        line_no = content[:m.start()].count('\n') + 1
                        snippet = content[m.start():m.start()+80].replace('\n', ' ')
                        print(f"{fp}:{line_no} [SELECT_NO_ONCHANGE] {snippet}")

                # Check inputs without onChange
                for m in re.finditer(r'<input\b([^>]*)>', content):
                    attrs = m.group(1)
                    if 'type="file"' not in attrs and 'type="checkbox"' not in attrs and 'type="radio"' not in attrs and 'onChange' not in attrs and 'readOnly' not in attrs:
                        line_no = content[:m.start()].count('\n') + 1
                        snippet = content[m.start():m.start()+80].replace('\n', ' ')
                        print(f"{fp}:{line_no} [INPUT_NO_ONCHANGE] {snippet}")
