import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily or securely
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const triageSchema = {
  type: Type.OBJECT,
  properties: {
    isLast: {
      type: Type.BOOLEAN,
      description: "True if sufficient information is gathered to provide final clinic recommendation (usually after 3-4 questions); False if another follow-up question is needed."
    },
    question: {
      type: Type.STRING,
      description: "Direct concise follow-up question in Arabic (under 20 words). Required if isLast is false."
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 to 4 concise options in Arabic. Required if isLast is false."
    },
    allowCustomInput: {
      type: Type.BOOLEAN,
      description: "Always true if isLast is false."
    },
    recommendedTiming: {
      type: Type.STRING,
      description: "Single concise visit timing phrase under 8 words in Arabic (e.g., 'حجز موعد خلال 24 إلى 48 ساعة' or 'زيارة العيادة اليوم خلال 3 ساعات'). Never repeat text."
    },
    clinicInfo: {
      type: Type.OBJECT,
      properties: {
        clinicName: {
          type: Type.STRING,
          description: "Recommended clinic specialty name in Arabic (e.g., 'عيادة المخ والأعصاب' or 'عيادة الجهاز الهضمي')."
        },
        doctorName: {
          type: Type.STRING,
          description: "Recommended doctor specialty in Arabic (e.g., 'د. استشاري طب المخ والأعصاب')."
        },
        clinicFeatures: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Array of 3 brief clinic features in Arabic."
        },
        clinicPath: {
          type: Type.STRING,
          description: "Directions inside medical facility in Arabic (e.g., 'مبنى العيادات التخصصية - الدور الثاني - عيادة 204')."
        }
      }
    },
    patientGuidance: {
      type: Type.OBJECT,
      properties: {
        whileWaiting: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "2 to 3 concise, calming actions while waiting."
        },
        thingsToAvoid: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "2 to 3 concise things to avoid based on symptoms."
        }
      }
    },
    disclaimer: {
      type: Type.STRING,
      description: "Short Arabic medical disclaimer."
    }
  },
  required: ["isLast"]
};

// Helper function to repair cut-off or malformed JSON strings
function tryParseJson(text: string): any {
  let clean = text.trim();
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  // 1. Direct parse
  try {
    return JSON.parse(clean);
  } catch (_) {}

  // 2. Extract JSON object substring
  const firstBrace = clean.indexOf("{");
  if (firstBrace !== -1) {
    let candidate = clean.slice(firstBrace);
    // If cut off before closing brace, attempt to close strings and brackets
    try {
      return JSON.parse(candidate);
    } catch (_) {
      // If it ends mid-string in recommendedTiming or any other field, strip trailing garbage
      const lastQuote = candidate.lastIndexOf('"');
      if (lastQuote > 0) {
        const truncated = candidate.slice(0, lastQuote + 1) + "}";
        try {
          return JSON.parse(truncated);
        } catch (_) {}
      }
    }
  }

  throw new Error("Unable to parse model JSON output");
}

app.post("/api/triage", async (req, res) => {
  try {
    const { chiefComplaint, history } = req.body;

    if (!chiefComplaint || typeof chiefComplaint !== "string") {
      return res.status(400).json({ error: "الرجاء تقديم الشكوى الرئيسية" });
    }

    const ai = getGenAI();

    const currentStepCount = Array.isArray(history) ? history.length : 0;
    const historyText = Array.isArray(history) && history.length > 0
      ? history.map((item: { question: string; answer: string }, idx: number) => `سؤال ${idx + 1}: ${item.question}\nإجابة المريض: ${item.answer}`).join("\n\n")
      : "لا توجد أسئلة سابقة بعد.";

    const systemInstruction = `
أنت نظام فرز وتوجيه طبي ذكي واحترافي اسمه MedPath AI.
مهمتك: تحليل شكوى المريض وإجاباته، وطرح أسئلة متدرجة لتوجيهه إلى العيادة والطبيب الأنسب.

قواعد صارمة للإيجاز والدقة:
1. ممنوع منعاً باتاً تكرار الكلمات أو الجمل. لا تكرر أي عبارة أبداً.
2. لا تعرض أي مستوى خطورة (Severity level) أو درجة طوارئ رقمية أو تشخيص نهائي.
3. عدد الأسئلة:
   - إذا كان عدد الإجابات السابقة أقل من 3 (حالياً: ${currentStepCount} إجابات)، اطرح سؤال متابعة دقيق وسهل واجعل "isLast": false.
   - إذا كان عدد الإجابات السابقة 3 إجابات أو أكثر، ولديك وضوح كافٍ للعيادة، أنهِ الاستبيان واجعل "isLast": true مع ملء بيانات العيادة والإرشادات.
4. عندما تكون isLast = false:
   - question: سؤال متابعة واضح ومختصر جداً (سطر واحد فقط).
   - options: مصفوفة من 3 إلى 4 خيارات موجزة.
   - allowCustomInput: true.
5. عندما تكون isLast = true:
   - recommendedTiming: جملة واحدة وجيزة جداً لا تتعدى 6 كلمات، مثل: "حجز موعد خلال 24 إلى 48 ساعة" أو "زيارة العيادة اليوم خلال 3 ساعات". يمنع الإطالة أو التكرار.
   - clinicInfo: اسم العيادة واسم الطبيب و3 مميزات ومسار العيادة داخل المنشأة.
   - patientGuidance: 2-3 نصائح أثناء الانتظار، و2-3 محاذير لتجنبها.
   - disclaimer: "هذا الإرشاد لأغراض التنظيم والتوجيه الطبي فقط، وليس تشخيصاً طبياً نهائياً."
    `.trim();

    const userPrompt = `
الشكوى الرئيسية للمريض:
"${chiefComplaint}"

سجل الأسئلة والأجوبة السابقة (عددها ${currentStepCount}):
${historyText}

حدد بدقة ما إذا كنت بحاجة لسؤال إضافي أم التوصية النهائية بالعيادة والتوقيت، وأخرج النتيجة بصيغة JSON نظيفة وموجزة دون أي تكرار.
    `.trim();

    // Use gemini-3.6-flash as primary, with fallback to gemini-3.8-flash
    const modelsToTry = ["gemini-3.6-flash", "gemini-3.8-flash"];
    let lastError: any = null;
    let text = "";

    for (const modelName of modelsToTry) {
      // Allow up to 2 attempts per model in case of temporary 503 spikes
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: userPrompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: triageSchema,
              temperature: 0.5,
              maxOutputTokens: 1024,
            },
          });

          text = response.text || "";
          if (text) {
            break; // Success with this model
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${modelName} (attempt ${attempt}) error:`, err?.message || err);
          if (attempt === 1 && (err?.status === "UNAVAILABLE" || String(err?.message || "").includes("503"))) {
            // Wait 600ms before second attempt
            await new Promise((r) => setTimeout(r, 600));
          }
        }
      }

      if (text) {
        break; // Got output, stop trying further models
      }
    }

    if (!text) {
      if (lastError?.status === "UNAVAILABLE" || lastError?.message?.includes("503") || lastError?.message?.includes("high demand")) {
        return res.status(503).json({
          error: "خدمة الذكاء الاصطناعي تشهد ضغطاً مؤقتاً، يرجى إعادة المحاولة بعد لحظات قليلة.",
          message: "الخدمة مشغولة مؤقتاً، يرجى النقر على زر 'إعادة المحاولة'."
        });
      }
      throw lastError || new Error("لم يتم تلقي استجابة من الذكاء الاصطناعي");
    }

    let jsonResult: any;
    try {
      jsonResult = tryParseJson(text);
    } catch (parseErr) {
      console.error("Failed to parse Gemini output, raw text:", text);
      // Fallback safe object if parsing failed completely
      if (currentStepCount >= 2) {
        jsonResult = {
          isLast: true,
          recommendedTiming: "حجز موعد خلال 24-48 ساعة",
          clinicInfo: {
            clinicName: "عيادة الطب التخصصي - الاستشارات العامة",
            doctorName: "د. استشاري التوجيه الطبي العام",
            clinicFeatures: ["فحص سريري شامل", "تحاليل فورية", "توجيه دقيق"],
            clinicPath: "مبنى العيادات الخارجية - الدور الأول"
          },
          patientGuidance: {
            whileWaiting: ["الراحة وتجنب الإجهاد البدني", "شرب كميات مناسبة من الماء"],
            thingsToAvoid: ["تجنب الأطعمة الدسمة", "تجنب تناول أدوية دون وصفة"]
          },
          disclaimer: "هذا الإرشاد لأغراض التنظيم والتوجيه الطبي فقط، وليس تشخيصاً طبياً نهائياً."
        };
      } else {
        jsonResult = {
          isLast: false,
          question: "هل تزداد هذه الأعراض مع بذل أي مجهود أو بعد أوقات معينة؟",
          options: ["نعم، تزداد مع الحركة أو المجهود", "تحدث غالباً وقت الراحة أو النوم", "مستمرة دون تغيير واضح", "تحدث بعد تناول وجبات معينة"],
          allowCustomInput: true
        };
      }
    }

    // Safeguard fields to prevent client-side undefined.map crashes
    if (!jsonResult.isLast) {
      if (!Array.isArray(jsonResult.options) || jsonResult.options.length === 0) {
        jsonResult.options = ["نعم، أشعر بذلك بشكل واضح", "لا، ليس بالتحديد", "توجد أعراض أخرى متفرقة"];
      }
      if (!jsonResult.question) {
        jsonResult.question = "هل يمكنك توضيح المزيد حول شدة وتوقيت هذه الأعراض؟";
      }
      jsonResult.allowCustomInput = true;
    } else {
      // Ensure recommendedTiming is clean and not repetitively concatenated
      if (typeof jsonResult.recommendedTiming === "string") {
        const sentences = jsonResult.recommendedTiming.split(/[.،\n]/).filter((s: string) => s.trim().length > 0);
        jsonResult.recommendedTiming = sentences.length > 0 ? sentences[0].trim() : "حجز موعد خلال 24 إلى 48 ساعة";
      } else {
        jsonResult.recommendedTiming = "حجز موعد خلال 24 إلى 48 ساعة";
      }

      if (!jsonResult.clinicInfo) {
        jsonResult.clinicInfo = {
          clinicName: "عيادة التخصص الطبي المعني",
          doctorName: "د. استشاري الفرز والتوجيه الطبي",
          clinicFeatures: ["خدمة فورية بدون انتظار", "مختبر تحاليل شامل", "أجهزة تشخيص متطورة"],
          clinicPath: "قسم العيادات الخارجية - المبنى الرئيسي - الدور الأول"
        };
      } else {
        jsonResult.clinicInfo.clinicName = jsonResult.clinicInfo.clinicName || "عيادة التوجيه الطبي المختصة";
        jsonResult.clinicInfo.doctorName = jsonResult.clinicInfo.doctorName || "د. استشاري التخصص المعني";
        jsonResult.clinicInfo.clinicFeatures = Array.isArray(jsonResult.clinicInfo.clinicFeatures) && jsonResult.clinicInfo.clinicFeatures.length > 0
          ? jsonResult.clinicInfo.clinicFeatures.slice(0, 3)
          : ["خدمة فورية", "فحوصات سريعة", "متابعة متكاملة"];
        jsonResult.clinicInfo.clinicPath = jsonResult.clinicInfo.clinicPath || "قسم العيادات الخارجية - الدور الأول";
      }

      if (!jsonResult.patientGuidance) {
        jsonResult.patientGuidance = {
          whileWaiting: ["استرح في مكان هادئ ومريح", "اشرب كميات معتدلة من السوائل"],
          thingsToAvoid: ["تجنب المجهود البدني الزائد", "تجنب تناول الأطعمة الثقيلة"]
        };
      } else {
        jsonResult.patientGuidance.whileWaiting = Array.isArray(jsonResult.patientGuidance.whileWaiting) && jsonResult.patientGuidance.whileWaiting.length > 0
          ? jsonResult.patientGuidance.whileWaiting.slice(0, 3)
          : ["استرح في مكان هادئ ومريح"];
        jsonResult.patientGuidance.thingsToAvoid = Array.isArray(jsonResult.patientGuidance.thingsToAvoid) && jsonResult.patientGuidance.thingsToAvoid.length > 0
          ? jsonResult.patientGuidance.thingsToAvoid.slice(0, 3)
          : ["تجنب المجهود البدني الزائد"];
      }

      jsonResult.disclaimer = jsonResult.disclaimer || "هذا الإرشاد لأغراض التنظيم والتوجيه الطبي فقط، وليس تشخيصاً طبياً نهائياً.";
    }

    return res.json(jsonResult);
  } catch (err: any) {
    console.error("Error in /api/triage:", err);
    return res.status(500).json({
      error: "حدث خطأ أثناء معالجة الطلب.",
      message: err?.message || "Internal server error",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MedPath AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
