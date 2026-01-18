import { GoogleGenerativeAI } from "@google/generative-ai";

// KI‑Client initialisieren (Vite nutzt import.meta.env)
const ai = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

export const parseInvoiceImage = async (base64Image: string) => {
  try {
    const response = await ai.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
            {
              text: `
Extrahiere folgende Daten aus der Arztrechnung:

- Name des Arztes / der Praxis
- Rechnungsnummer
- Rechnungsdatum
- Gesamtbetrag
- Fälligkeitsdatum (Zahlbar bis)

Gib die Antwort **ausschließlich als JSON** zurück mit diesen Feldern:
doctorName, billingProvider, billNumber, date, dueDate, amount
              `,
            },
          ],
        },
      ],
    });

    const text = await response.text();
    return JSON.parse(text || "{}");
  } catch (error) {
    console.error("Fehler beim KI‑Parsing:", error);
    throw error;
  }
};
