import type { TripQuery, AgentResult } from "./types";

export interface TranslationPhrase {
  english: string;
  translated: string;
  language: string;
}

const TRAVEL_PHRASES = [
  "Hello, how are you?",
  "Where is the hotel?",
  "How much does this cost?",
  "Thank you very much",
  "I need help please",
  "Where is the airport?",
  "Can I have the bill?",
  "I am a tourist",
];

const DEST_LANGUAGES: Record<string, { code: string; name: string }> = {
  france: { code: "fr", name: "French" },
  paris: { code: "fr", name: "French" },
  spain: { code: "es", name: "Spanish" },
  germany: { code: "de", name: "German" },
  italy: { code: "it", name: "Italian" },
  japan: { code: "ja", name: "Japanese" },
  tokyo: { code: "ja", name: "Japanese" },
  china: { code: "zh", name: "Chinese" },
  thailand: { code: "th", name: "Thai" },
  bangkok: { code: "th", name: "Thai" },
  vietnam: { code: "vi", name: "Vietnamese" },
  indonesia: { code: "id", name: "Indonesian" },
  bali: { code: "id", name: "Indonesian" },
  india: { code: "hi", name: "Hindi" },
  goa: { code: "hi", name: "Hindi" },
  delhi: { code: "hi", name: "Hindi" },
  mumbai: { code: "hi", name: "Hindi" },
  jaipur: { code: "hi", name: "Hindi" },
  kerala: { code: "ml", name: "Malayalam" },
  korea: { code: "ko", name: "Korean" },
  russia: { code: "ru", name: "Russian" },
  turkey: { code: "tr", name: "Turkish" },
  portugal: { code: "pt", name: "Portuguese" },
  brazil: { code: "pt", name: "Portuguese" },
  dubai: { code: "ar", name: "Arabic" },
};

// Offline phrasebook for common destinations (no API needed)
const PHRASEBOOK: Record<string, Record<string, string>> = {
  hi: {
    "Hello, how are you?": "नमस्ते, आप कैसे हैं?",
    "Where is the hotel?": "होटल कहाँ है?",
    "How much does this cost?": "इसकी कीमत कितनी है?",
    "Thank you very much": "बहुत बहुत धन्यवाद",
    "I need help please": "कृपया मुझे मदद चाहिए",
    "Where is the airport?": "हवाई अड्डा कहाँ है?",
    "Can I have the bill?": "क्या मुझे बिल मिल सकता है?",
    "I am a tourist": "मैं एक पर्यटक हूँ",
  },
  fr: {
    "Hello, how are you?": "Bonjour, comment allez-vous?",
    "Where is the hotel?": "Où est l'hôtel?",
    "How much does this cost?": "Combien ça coûte?",
    "Thank you very much": "Merci beaucoup",
    "I need help please": "J'ai besoin d'aide s'il vous plaît",
    "Where is the airport?": "Où est l'aéroport?",
    "Can I have the bill?": "L'addition s'il vous plaît?",
    "I am a tourist": "Je suis touriste",
  },
  es: {
    "Hello, how are you?": "Hola, ¿cómo estás?",
    "Where is the hotel?": "¿Dónde está el hotel?",
    "How much does this cost?": "¿Cuánto cuesta esto?",
    "Thank you very much": "Muchas gracias",
    "I need help please": "Necesito ayuda por favor",
    "Where is the airport?": "¿Dónde está el aeropuerto?",
    "Can I have the bill?": "¿Me puede dar la cuenta?",
    "I am a tourist": "Soy turista",
  },
  ja: {
    "Hello, how are you?": "こんにちは、お元気ですか?",
    "Where is the hotel?": "ホテルはどこですか?",
    "How much does this cost?": "これはいくらですか?",
    "Thank you very much": "どうもありがとうございます",
    "I need help please": "助けてください",
    "Where is the airport?": "空港はどこですか?",
    "Can I have the bill?": "お会計をお願いします",
    "I am a tourist": "私は観光客です",
  },
  th: {
    "Hello, how are you?": "สวัสดี สบายดีไหม?",
    "Where is the hotel?": "โรงแรมอยู่ที่ไหน?",
    "How much does this cost?": "ราคาเท่าไหร่?",
    "Thank you very much": "ขอบคุณมากครับ/ค่ะ",
    "I need help please": "ช่วยด้วยครับ/ค่ะ",
    "Where is the airport?": "สนามบินอยู่ที่ไหน?",
    "Can I have the bill?": "เก็บเงินด้วยครับ/ค่ะ",
    "I am a tourist": "ผม/ดิฉันเป็นนักท่องเที่ยว",
  },
  ar: {
    "Hello, how are you?": "مرحبا، كيف حالك؟",
    "Where is the hotel?": "أين الفندق؟",
    "How much does this cost?": "كم يكلف هذا؟",
    "Thank you very much": "شكراً جزيلاً",
    "I need help please": "أحتاج مساعدة من فضلك",
    "Where is the airport?": "أين المطار؟",
    "Can I have the bill?": "هل يمكنني الحصول على الفاتورة؟",
    "I am a tourist": "أنا سائح",
  },
};

export async function runTranslationAgent(query: TripQuery): Promise<AgentResult<TranslationPhrase[]>> {
  const start = performance.now();
  try {
    const dest = query.destination.toLowerCase();
    const lang = DEST_LANGUAGES[dest] || { code: "hi", name: "Hindi" };
    const phrasebook = PHRASEBOOK[lang.code];

    if (phrasebook) {
      const phrases: TranslationPhrase[] = TRAVEL_PHRASES.map((phrase) => ({
        english: phrase,
        translated: phrasebook[phrase] || phrase,
        language: lang.name,
      }));
      return { agent: "Translation", status: "success", data: phrases, ms: performance.now() - start };
    }

    // Fallback for unknown languages
    const phrases: TranslationPhrase[] = TRAVEL_PHRASES.slice(0, 4).map((phrase) => ({
      english: phrase,
      translated: `[${lang.name} translation]`,
      language: lang.name,
    }));
    return { agent: "Translation", status: "success", data: phrases, ms: performance.now() - start };
  } catch (e) {
    return { agent: "Translation", status: "error", error: String(e), ms: performance.now() - start };
  }
}
