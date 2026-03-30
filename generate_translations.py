import json

# Target text
text_zh = "请询问当前场景相关常用语，如需询问其他场景，请重新添加场景。"

# Translation mapping (approximate)
translations_map = {
    "zh": "请询问当前场景相关常用语，如需询问其他场景，请重新添加场景。",
    "zh-cn": "请询问当前场景相关常用语，如需询问其他场景，请重新添加场景。",
    "zh-hans": "请询问当前场景相关常用语，如需询问其他场景，请重新添加场景。",
    "zh-hant": "請詢問當前場景相關常用語，如需詢問其他場景，請重新添加場景。",
    "zh-tw": "請詢問當前場景相關常用語，如需詢問其他場景，請重新添加場景。",
    "zh-hk": "請詢問當前場景相關常用語，如需詢問其他場景，請重新添加場景。",
    "en": "Please ask for common phrases related to the current scene; if you need to ask about other scenes, please add the scene again.",
    "en-us": "Please ask for common phrases related to the current scene; if you need to ask about other scenes, please add the scene again.",
    "en-gb": "Please ask for common phrases related to the current scene; if you need to ask about other scenes, please add the scene again.",
    "en-au": "Please ask for common phrases related to the current scene; if you need to ask about other scenes, please add the scene again.",
    "en-ca": "Please ask for common phrases related to the current scene; if you need to ask about other scenes, please add the scene again.",
    "en-nz": "Please ask for common phrases related to the current scene; if you need to ask about other scenes, please add the scene again.",
    "en-za": "Please ask for common phrases related to the current scene; if you need to ask about other scenes, please add the scene again.",
    "en-ph": "Please ask for common phrases related to the current scene; if you need to ask about other scenes, please add the scene again.",
    "ja": "現在のシーンに関連する一般的な語句を尋ねてください。別のシーンについて尋ねる場合は、シーンを再度追加してください。",
    "ko": "현재 장면과 관련된 상용구를 요청하십시오. 다른 장면에 대해 문의하려면 장면을 다시 추가하십시오.",
    "fr": "Veuillez demander des expressions courantes liées à la scène actuelle ; pour d'autres scènes, veuillez rajouter la scène.",
    "fr-ca": "Veuillez demander des expressions courantes liées à la scène actuelle ; pour d'autres scènes, veuillez rajouter la scène.",
    "fr-ch": "Veuillez demander des expressions courantes liées à la scène actuelle ; pour d'autres scènes, veuillez rajouter la scène.",
    "de": "Bitte fragen Sie nach gängigen Redewendungen für die aktuelle Szene. Um nach anderen Szenen zu fragen, fügen Sie die Szene bitte erneut hinzu.",
    "es": "Por favor, pregunte por frases comunes relacionadas con la escena actual; para preguntar por otras escenas, vuelva a añadir la escena.",
    "es-mx": "Por favor, pregunte por frases comunes relacionadas con la escena actual; para preguntar por otras escenas, vuelva a añadir la escena.",
    "es-es": "Por favor, pregunte por frases comunes relacionadas con la escena actual; para preguntar por otras escenas, vuelva a añadir la escena.",
    "es-ar": "Por favor, pregunte por frases comunes relacionadas con la escena actual; para preguntar por otras escenas, vuelva a añadir la escena.",
    "es-co": "Por favor, pregunte por frases comunes relacionadas con la escena actual; para preguntar por otras escenas, vuelva a añadir la escena.",
    "es-cl": "Por favor, pregunte por frases comunes relacionadas con la escena actual; para preguntar por otras escenas, vuelva a añadir la escena.",
    "es-pe": "Por favor, pregunte por frases comunes relacionadas con la escena actual; para preguntar por otras escenas, vuelva a añadir la escena.",
    "pt": "Por favor, peça frases comuns relacionadas com a cena atual; para perguntar sobre outras cenas, adicione a cena novamente.",
    "pt-br": "Por favor, peça frases comuns relacionadas com a cena atual; para perguntar sobre outras cenas, adicione a cena novamente.",
    "pt-pt": "Por favor, peça frases comuns relacionadas com a cena atual; para perguntar sobre outras cenas, adicione a cena novamente.",
    "ru": "Пожалуйста, запрашивайте общеупотребительные фразы, относящиеся к текущей сцене; для других сцен добавьте сцену повторно.",
    "ar": "يرجى السؤال عن العبارات الشائعة المتعلقة بالمشهد الحالي؛ للسؤال عن مشاهد أخرى، يرجى إضافة المشهد مرة أخرى.",
    "ar-sa": "يرجى السؤال عن العبارات الشائعة المتعلقة بالمشهد الحالي؛ للسؤال عن مشاهد أخرى، يرجى إضافة المشهد مرة أخرى.",
    "it": "Si prega di chiedere frasi comuni relative alla scena corrente; per altre scene, aggiungere nuovamente la scena.",
    "nl": "Vraag naar veelvoorkomende uitdrukkingen voor de huidige scène; voeg de scène opnieuw toe om naar andere scènes te vragen.",
    "nl-be": "Vraag naar veelvoorkomende uitdrukkingen voor de huidige scène; voeg de scène opnieuw toe om naar andere scènes te vragen.",
    "pl": "Proszę pytać o typowe zwroty związane z bieżącą sceną; aby zapytać o inne sceny, proszę ponownie dodać scenę.",
    "tr": "Mevcut sahneyle ilgili yaygın ifadeleri sorun; diğer sahneler hakkında soru sormak için lütfen sahneyi tekrar ekleyin.",
    "vi": "Vui lòng hỏi các cụm từ thông dụng liên quan đến cảnh hiện tại; để hỏi về các cảnh khác, vui lòng thêm lại cảnh đó.",
    "th": "โปรดสอบถามวลีทั่วไปที่เกี่ยวข้องกับฉากปัจจุบัน หากต้องการสอบถามเกี่ยวกับฉากอื่น โปรดเพิ่มฉากอีกครั้ง",
    "id": "Silakan tanyakan ungkapan umum terkait adegan saat ini; untuk menanyakan adegan lain, silakan tambahkan adegan lagi.",
    "ms": "Sila tanya ungkapan lazim berkaitan pemandangan semasa; untuk tanya tentang pemandangan lain, sila tambah pemandangan semula.",
    "hi": "कृपया वर्तमान दृश्य से संबंधित सामान्य वाक्यांशों के बारे में पूछें; अन्य दृश्यों के बारे में पूछने के लिए, कृपया दृश्य को फिर से जोड़ें।",
    "bn": "বর্তমান দৃশ্য সম্পর্কিত সাধারণ বাক্যাংশ জিজ্ঞাসা করুন; অন্য দৃশ্য সম্পর্কে জিজ্ঞাসা করতে, আবার দৃশ্যটি যোগ করুন।",
    "ta": "தற்போதைய காட்சியுடன் தொடர்புடைய பொதுவான சொற்றொடர்களைக் கேட்கவும்; பிற காட்சிகளைப் பற்றி கேட்க, காட்சியை மீண்டும் சேர்க்கவும்.",
    "te": "ప్రస్తుత దృశ్యానికి సంబంధించిన సాధారణ పదబంధాలను అడగండి; ఇతర దృశ్యాల గురించి అడగడానికి, దయచేసి దృశ్యాన్ని మళ్లీ జోడించండి.",
    "mr": "सध्याच्या दृश्याशी संबंधित सामान्य वाक्ये विचारा; इतर दृश्यांबद्दल विचारण्यासाठी, कृपया दृश्य पुन्हा जोडा.",
    "gu": "વર્તમાન દ્રશ્ય સંબંધિત સામાન્ય શબ્દસમૂહો માટે પૂછો; અન્ય દ્રશ્યો વિશે પૂછવા માટે, કૃપા કરીને દ્રશ્ય ફરીથી ઉમેરો.",
    "kn": "ಪ್ರಸ್ತುತ ದೃಶ್ಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಸಾಮಾನ್ಯ ನುಡಿಗಟ್ಟುಗಳನ್ನು ಕೇಳಿ; ಇತರ ದೃಶ್ಯಗಳ ಬಗ್ಗೆ ಕೇಳಲು, ದಯವಿಟ್ಟು ದೃಶ್ಯವನ್ನು ಮತ್ತೆ ಸೇರಿಸಿ.",
    "ml": "നിലവിലെ രംഗവുമായി ബന്ധപ്പെട്ട പൊതുവായ ശൈലികൾ ചോദിക്കുക; മറ്റ് രംഗങ്ങളെക്കുറിച്ച് ചോദിക്കാൻ, ദയവായി രംഗം വീണ്ടും ചേർക്കുക.",
    "uk": "Будь ласка, запитуйте загальновживані фрази, пов'язані з поточною сценою; для інших сцен додайте сцену знову.",
    "cs": "Zeptejte se na běžné fráze související s aktuální scénou; pro dotaz na jiné scény scénu znovu přidejte.",
    "el": "Παρακαλούμε ζητήστε κοινές φράσεις που σχετίζονται με την τρέχουσα σκηνή. για άλλες σκηνές, προσθέστε ξανά τη σκηνή.",
    "he": "אנא בקש ביטויים נפוצים הקשורים לסצנה הנוכחית; כדי לשאול על סצנות אחרות, אנא הוסף את הסצנה שוב.",
    "hu": "Kérjük, érdeklődjön az aktuális jelenethez kapcsolódó gyakori kifejezésekről; más jelenetekhez adja hozzá újra a jelenetet.",
    "sv": "Be om vanliga fraser relaterade till den aktuella scenen; för andra scener, lägg till scenen igen.",
    "da": "Spørg om almindelige udtryk relateret til den aktuelle scene; for andre scener, tilføj venligst scenen igen.",
    "fi": "Kysy nykyiseen kohtaukseen liittyviä yleisiä ilmauksia; jos haluat kysyä muista kohtauksista, lisää kohtaus uudelleen.",
    "no": "Spør om vanlige uttrykk knyttet til den gjeldende scenen; for andre scener, vennligst legg til scenen igjen.",
    "nb": "Spør om vanlige uttrykk knyttet til den gjeldende scenen; for andre scener, vennligst legg til scenen igjen.",
    "bg": "Моля, попитайте за често използвани фрази, свързани с текущата сцена; за други сцени, моля, добавете сцената отново.",
    "ro": "Vă rugăm să întrebați despre expresiile comune legate de scena curentă; pentru alte scene, vă rugăm să adăugați din nou scena.",
    "sk": "Opýtajte sa na bežné fráze súvisiace s aktuálnou scénou; pre iné scény scénu znova pridajte.",
    "sl": "Prosimo, vprašajte za pogoste fraze, povezane s trenutnim prizorom; za druge prizore ponovno dodajte prizor.",
    "hr": "Molimo pitajte za uobičajene fraze povezane s trenutnom scenom; za ostale scene, ponovno dodajte scenu.",
    "sr": "Молимо вас да питате за уобичајене фразе повезане са тренутном сценом; за друге сцене, поново додајте сцену.",
    "ca": "Demaneu frases habituales relacionades amb l'escena actual; per a altres escenes, torneu a afegir l'escena.",
    "tl": "Mangyaring magtanong para sa mga karaniwang parirala na may kaugnayan sa kasalukuyang eksena; para sa iba pang mga eksena, mangyaring muling idagdag ang eksena.",
    "fil": "Mangyaring magtanong para sa mga karaniwang parirala na may kaugnayan sa kasalukuyang eksena; para sa iba pang mga eksena, mangyaring muling idagdag ang eksena.",
    "sw": "Tafadhali uliza misemo ya kawaida inayohusiana na eneo la sasa; kwa matukio mengine, tafadhali ongeza tukio tena.",
    "fa": "لطفاً عبارات رایج مربوط به صحنه فعلی را بپرسید. برای پرسیدن در مورد صحنه های دیگر، لطفاً صحنه را دوباره اضافه کنید.",
    "ur": "براہ کرم موجودہ منظر سے متعلق عام جملے پوچھیں۔ دوسرے مناظر کے بارے میں پوچھنے کے لیے، براہ کرم منظر کو دوبارہ شامل کریں۔",
    "pa": "ਕਿਰਪਾ ਕਰਕੇ ਮੌਜੂਦਾ ਦ੍ਰਿਸ਼ ਨਾਲ ਸਬੰਧਤ ਆਮ ਵਾਕਾਂਸ਼ਾਂ ਬਾਰੇ ਪੁੱਛੋ; ਹੋਰ ਦ੍ਰਿਸ਼ਾਂ ਬਾਰੇ ਪੁੱਛਣ ਲਈ, ਕਿਰਪਾ ਕਰਕੇ ਦ੍ਰਿਸ਼ ਨੂੰ ਦੁਬਾਰਾ ਜੋੜੋ।",
    "az": "Cari səhnə ilə bağlı ümumi ifadələr barədə soruşun; digər səhnələr üçün zəhmət olmasa səhnəni yenidən əlavə edin.",
    "be": "Калі ласка, запытвайце агульнаўжывальныя фразы, звязаныя з бягучай сцэнай; для іншых сцэн дадайце сцэну зноў.",
    "bs": "Molimo pitajte za uobičajene fraze vezane za trenutnu scenu; za druge scene, ponovo dodajte scenu.",
    "bs-cyrl": "Молимо питајте за уобичајене фразе везане за тренутну сцену; за друге сцене, поново додајте сцену.",
    "et": "Palun küsige praeguse stseeniga seotud tavalisi väljendeid; muude stseenide puhul lisage stseen uuesti.",
    "ka": "გთხოვთ, იკითხოთ მიმდინარე სცენასთან დაკავშირებული გავრცელებული ფრაზები; სხვა სცენებისთვის, გთხოვთ, კვლავ დაამატოთ სცენა.",
    "ky": "Учурдагы көрүнүшкө байланыштуу жалпы фразаларды сураңыз; башка көрүнүштөр үчүн көрүнүштү кайра кошуңуз.",
    "lo": "ກະລຸນາຖາມກ່ຽວກັບວະລີທົ່ວໄປທີ່ກ່ຽວຂ້ອງກັບສາກປັດຈຸບັນ; ສໍາລັບສາກອື່ນໆ, ກະລຸນາເພີ່ມສາກຄືນໃໝ່.",
    "lv": "Lūdzu, jautājiet par bieži lietotām frāzēm saistībā ar pašreizējo ainu; citām ainām, lūdzu, pievienojiet ainu vēlreiz.",
    "lt": "Teiraukitės dažniausiai vartojamų frazių, susijusių su dabartine scena; kitoms scenoms vėl pridėkite sceną.",
    "mk": "Ве молиме прашајте за вообичаени фрази поврзани со тековната сцена; за други сцени, ве молиме повторно додајте ја сцената.",
    "mn": "Одоогийн үзэгдэлтэй холбоотой нийтлэг хэллэгийг асууна уу; бусад үзэгдлийн талаар асуухын тулд үзэгдлийг дахин нэмнэ үү.",
    "ne": "कृपया हालको दृश्यसँग सम्बन्धित सामान्य वाक्यांशहरूको बारेमा सोध्नुहोस्; अन्य दृश्यहरूको बारे में सोध्न, कृपया दृश्य पुन: थप्नुहोस्.",
    "tg": "Лутфан ибораҳои маъмулии марбут ба саҳнаи ҷориро пурсед; барои дигар саҳнаҳо, лутфан саҳનાро дубора илова кунед.",
    "uz": "Joriy sahna bilan bog'liq umumiy iboralarni so'rang; boshqa sahnalar haqida so'rash uchun sahnani qayta qo'shing.",
    "cy": "Gofynnwch am ymadroddion cyffredin sy'n gysylltiedig â'r olygfa bresennol; ar gyfer golygfeydd eraill, ychwanegwch yr olygfa eto.",
    "zu": "Sicela ubuze ngemisho evamile ehlobene nendawo yamanje; kwezinye izigcawu, sicela wengeze indawo futhi.",
    "af": "Vra asseblief vir algemene frases wat verband hou met die huidige toneel; vir ander tonele, voeg asseblief die toneel weer by.",
    "sq": "Ju lutem pyesni për frazat e zakonshme që lidhen me skenën aktuale; për skena të tjera, ju lutem shtoni përsëri skenën.",
    "am": "እባክዎን ከአሁኑ ትዕይንት ጋር የተያያዙ የተለመዱ ሀረጎችን ይጠይቁ፤ ለሌሎች ትዕይንቶች እባክዎን ትዕይንቱን እንደገና ያክሉ።",
    "hy": "Խնդրում ենք հարցնել ընթացիկ տեսարանի հետ կապված ընդհանուր արտահայտությունների մասին. այլ տեսարանների համար խնդրում ենք նորից ավելացնել տեսարանը:",
    "eu": "Mesedez, galdetu uneko eszenari lotutako esaldi ohikoak; beste eszena batzuei buruz galdetzeko, gehitu eszena berriro.",
    "my": "လက်ရှိဇာတ်ကွက်နှင့် သက်ဆိုင်သည့် ဘုံစကားစုများကို မေးမြန်းပါ။ အခြားဇာတ်ကွက်များအကြောင်း မေးမြန်းရန် ဇာတ်කွက်ကို ထပ်မံထည့်သွင်းပါ။",
    "fy": "Freegje asjebleaft foar mienskiplike útdrukkingen yn ferbân mei de aktuele sêne; foar oare sênes, foegje de sêne asjebleaft opnij ta.",
    "gl": "Pregunta por frases comúns relacionadas coa escena actual; para outras escenas, engade a escena de novo.",
    "gn": "Por favor, eporandu umi ñe'ẽnga jepiguáicha oñembojoajúva ko escena ko'ágãguávape; ambue escena-kuéra rehe eporandu hag̃ua, emoĩ jey pe escena.",
    "ha": "Da fatan za a nemi kalmomin gama-gari da suka shafi yanayin yanzu; don sauran al'amura, da fatan za a sake ƙara fage.",
    "ig": "Biko jụọ maka nkebi ahịrịokwu ndị a na-ejikarị metụtara ọnọdụ dị ugbu a; maka ihe nkiri ndị ọzọ, biko tinyegharịa ihe nkiri ahụ.",
    "ga": "Iarr frásaí coitianta a bhaineann leis an radharc reatha; le haghaidh radhairc eile, cuir an radharc leis arís.",
    "is": "Vinsamlegast spyrðu um algeng orðatiltæki sem tengjast núverande senu; fyrir aðrar senur, vinsamlegast bættu senunni við aftur.",
    "lb": "Fro w.e.g. no gemeinsamen Ausdréck am Zesummenhang mat der aktueller Zeen; fir aner Szenen, füügt d'Szen w.e.g. erëm derbäi.",
    "mt": "Jekk jogħġbok staqsi għal frażijiet komuni relatati max-xena attwali; għal xeni oħra, jekk jogħġbok żid ix-xena mill-ġdid.",
    "or": "ବର୍ତ୍ତମାନର ଦୃଶ୍ୟ ସହିତ ଜଡିତ ସାଧାରଣ ବାକ୍ୟାଂଶ ବିଷୟରେ ପଚାରନ୍ତୁ; ଅନ୍ୟ ଦୃଶ୍ୟ ବିଷୟରେ ପଚାରିବା ପାଇଁ, ଦୟାକରି ଦୃଶ୍ୟକୁ ପୁନର୍ବାର ଯୋଡନ୍ତୁ |",
    "gd": "Faighnich airson abairtean cumanta co-cheangailte ris an t-sealladh làithreach; airson seallaidhean eile, feuch an cuir thu an sealladh ris a-rithist.",
    "so": "Fadlan weydii odhaahyada caadiga ah ee la xiriira goobta hadda; muuqaalada kale, fadlan ku dar muuqaalka mar kale."
}

def generate_translations():
    info_file = r'f:\github\qwenTest\info.txt'
    output_file = r'f:\github\qwenTest\translations.json'
    
    result = {}
    
    try:
        with open(info_file, 'r', encoding='utf-8') as f:
            for line in f:
                if '->' not in line:
                    continue
                
                # Extract the part before '->'
                codes_part = line.split('->')[0].strip()
                # Remove leading '-' and split by comma
                if codes_part.startswith('-'):
                    codes_part = codes_part[1:].strip()
                
                codes = [c.strip() for c in codes_part.split(',')]
                
                for code in codes:
                    if code in translations_map:
                        result[code] = translations_map[code]
                    else:
                        # Fallback to English if not found, or just keep original Chinese
                        # For this task, I'll try to provide as many as possible.
                        # If a code is missing from map, I'll use the closest match or English.
                        base_code = code.split('-')[0]
                        if base_code in translations_map:
                            result[code] = translations_map[base_code]
                        else:
                            result[code] = translations_map.get('en', text_zh)
                            
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
            
        print(f"Successfully generated {len(result)} translations in {output_file}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_translations()
