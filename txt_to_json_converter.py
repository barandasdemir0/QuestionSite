"""
TXT to JSON Soru Dönüştürücü - Final Robust Versiyon
======================================================
"""
import re
import json
import os
import sys

# Try importing docx for Word file support
try:
    import docx
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    print("Uyarı: python-docx yüklü değil, .docx dosyaları desteklenmeyecek.")

DEFAULT_INPUT_FILE = "Yapay Zeka Uygulamaları Tüm Sorular.txt"
OUTPUT_FILE = "backend/data/questions.json"

def read_docx(file_path):
    if not DOCX_AVAILABLE:
        raise ImportError("python-docx kütüphanesi yüklü değil.")
    
    doc = docx.Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    # Join with newlines to simulate reading a text file
    return '\n'.join(full_text)

def parse_questions(content):
    questions = []
    lines = content.split('\n')
    i = 0
    qid = 1
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Boş satır, başlık vb. atla
        if not line or line.startswith('###') or line.startswith('---') or line.startswith('Bu sorular'):
            i += 1
            continue
        
        # 1. Günlük Hayat Problemleri
        if re.match(r'^(\d+)[\.\)]\s*\*\*Problem:\*\*', line):
            problem_match = re.match(r'^(\d+)[\.\)]\s*\*\*Problem:\*\*\s*(.+)', line)
            if problem_match:
                problem_text = problem_match.group(2).strip()
                j = i + 1
                soru_text = ''
                opts = []
                ans = ''
                
                while j < len(lines) and j < i + 35:
                    sub_line = lines[j].strip()
                    if sub_line.startswith('**Soru:**'):
                        soru_text = sub_line.replace('**Soru:**', '').strip()
                    elif re.match(r'^([a-dA-D])[\)\.]\s*(.+)', sub_line):
                        m = re.match(r'^([a-dA-D])[\)\.]\s*(.+)', sub_line)
                        opts.append({'harf': m.group(1).upper(), 'metin': m.group(2).strip()})
                    elif 'Cevap:' in sub_line or '(Doğru:' in sub_line:
                         m = re.search(r'(?:Cevap:|Doğru:)\s*\(?([a-dA-D])', sub_line, re.IGNORECASE)
                         if m: ans = m.group(1).upper()
                    
                    if (re.match(r'^\d+[\.\)]', sub_line) and j > i) or sub_line.startswith('###'):
                        break
                    j += 1
                
                if soru_text and len(opts) >= 2 and ans:
                    questions.append({
                        'id': qid,
                        'tip': 'coktan-secmeli',
                        'soruMetni': f"[Günlük Hayat Problemi] {problem_text} - {soru_text}",
                        'dogruCevap': ans,
                        'siklar': opts[:5]
                    })
                    qid += 1
                    i = j
                    continue

        # 2. Klasik Soru
        if re.match(r'^(\d+)[\.\)]\s*\*\*Soru:\*\*', line):
            klasik_match = re.match(r'^(\d+)[\.\)]\s*\*\*Soru:\*\*\s*(.+)', line)
            if klasik_match:
                q_text = klasik_match.group(2).strip()
                ans_text = "Belirtilmemiş"
                j = i + 1
                while j < len(lines) and j < i + 15:
                    if lines[j].strip().startswith('**Cevap:**'):
                        ans_text = lines[j].strip().replace('**Cevap:**', '').strip()
                        break
                    j += 1
                questions.append({ 'id': qid, 'tip': 'klasik', 'soruMetni': q_text, 'dogruCevap': ans_text })
                qid += 1
                i = j + 1
                continue

        # 3. Boşluk Doldurma
        if '________' in line:
            # Numara ile başlasın ya da başlamasın, içinde boşluk varsa al
            # Soru metnini temizle
            clean_line = re.sub(r'^\d+[\.\)]\s*', '', line)
            
            answer = "Belirtilmemiş"
            q_text_final = clean_line
            
            # (cevap) formatını ara
            if '(' in line and line.strip().endswith(')'):
                parts = line.strip().rsplit('(', 1)
                possible_ans = parts[1].strip(')')
                if len(possible_ans) < 60: # Makul cevap uzunluğu
                    answer = possible_ans
                    q_text_final = re.sub(r'^\d+[\.\)]\s*', '', parts[0]).strip()
            
            if '/' in answer: answer = answer.split('/')[0].strip()
            
            questions.append({
                'id': qid,
                'tip': 'bosluk-doldurma',
                'soruMetni': q_text_final,
                'dogruCevap': answer
            })
            qid += 1
            i += 1
            continue

        # 4. Standart Çoktan Seçmeli (Genel Yakalayıcı)
        # Sadece sayı ile başlayan satır (1. veya 1) )
        if re.match(r'^(\d+)[\.\)]\s+(.+)', line):
            m = re.match(r'^(\d+)[\.\)]\s+(.+)', line)
            q_text = m.group(2).strip()
            
            if len(q_text) < 5: # Çok kısa ise muhtemelen çöp
                i += 1
                continue
                
            opts = []
            ans = ''
            j = i + 1
            
            # Şıkları ara
            while j < len(lines) and j < i + 25:
                sub_line = lines[j].strip()
                
                # Şık
                if re.match(r'^([a-dA-D])[\)\.]\s*(.+)', sub_line):
                   om = re.match(r'^([a-dA-D])[\)\.]\s*(.+)', sub_line)
                   # Fix variable name 'm' -> 'om' was used but 'm' was used in text
                   opts.append({'harf': om.group(1).upper(), 'metin': om.group(2).strip()})
                
                # Cevap
                if 'cevap' in sub_line.lower() or 'doğru' in sub_line.lower() or 'dogru' in sub_line.lower():
                     am = re.search(r'(?:Cevap|Doğru|Dogru)[:\s]*\(?([a-dA-D])', sub_line, re.IGNORECASE)
                     if am: ans = am.group(1).upper()
                
                # Yeni soru başlangıcı
                if (re.match(r'^\d+[\.\)]', sub_line) and j > i) or sub_line.startswith('###'):
                    break
                j += 1
            
            # Sadece şık varsa bile ekle (bazen cevap satırı eksik olabilir ama soru sorudur)
            if len(opts) >= 2:
                if not ans: ans = "A" # Varsayılan kapalı cevap
                questions.append({
                    'id': qid,
                    'tip': 'coktan-secmeli',
                    'soruMetni': q_text,
                    'dogruCevap': ans,
                    'siklar': opts
                })
                qid += 1
                i = j
                continue

        i += 1
    return questions

def main():
    # Windows konsolunda Unicode karakterleri yazdırabilmek için
    if sys.stdout.encoding.lower() != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except AttributeError:
             pass # Python 3.6 ve altı için destek yok ama 3.10 kullanılıyor

    # Komut satırı argümanı kontrolü
    input_file = DEFAULT_INPUT_FILE
    course_name = "Genel" # Varsayılan Ders
    exam_type = "Genel"   # Varsayılan Sınav Tipi

    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        course_name = sys.argv[2]
    if len(sys.argv) > 3:
        exam_type = sys.argv[3]

    print(f"İşleniyor: {input_file} | Ders: {course_name} | Sınav: {exam_type}")
    
    # Dosyanın varlığını kontrol et
    if not os.path.exists(input_file):
        print(f"Hata: Dosya bulunamadı -> {input_file}")
        return

    try:
        content = ""
        # Dosya uzantısına göre okuma
        if input_file.lower().endswith('.docx'):
            content = read_docx(input_file)
        else:
            with open(input_file, 'r', encoding='utf-8') as f:
                content = f.read()
    except Exception as e:
        print(f"Hata oluştu: {str(e)}")
        return

    questions = parse_questions(content)
    
    # Sorulara ders ve sınav bilgisini ekle
    for q in questions:
        q['ders'] = course_name
        q['sinav'] = exam_type
    
    # Çıktı dosyasını güncelle - Ekleme Modu (Append) yerine 'Yeniden Yazma' (Overwrite) mı? 
    # Kullanıcı "içerideki soruları sil ekle" dediği için komple üzerine yazabiliriz.
    # Ancak "her defasında sil yapmayalım" dedi. Bu yüzden var olan json'ı okuyup üstüne eklemeliyiz.
    
    EXISTING_DATA = []
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
                EXISTING_DATA = json.load(f)
        except:
             EXISTING_DATA = []

    # Yeni soruları ekle (ID çakışmasını önlemek için ID'leri yeniden düzenleyebiliriz ama şimdilik basit ekle)
    # ID'leri benzersiz yapmak için mevcut en yüksek ID'yi bul
    max_id = 0
    if EXISTING_DATA:
        max_id = max(q.get('id', 0) for q in EXISTING_DATA)
    
    for q in questions:
        max_id += 1
        q['id'] = max_id
        EXISTING_DATA.append(q)

    # Klasör yoksa oluştur
    output_dir = os.path.dirname(OUTPUT_FILE)
    if output_dir and not os.path.exists(output_dir): os.makedirs(output_dir)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(EXISTING_DATA, f, ensure_ascii=False, indent=2)
        
    print(f"Başarılı! Eklenen Sorular: {len(questions)}")
    print(f"Toplam Veritabanı Sorusu: {len(EXISTING_DATA)}")

if __name__ == "__main__":
    main()
