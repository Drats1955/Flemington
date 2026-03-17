import { GoogleGenAI } from "@google/genai";

const HAZMAT_DATA = `
Hazardous Material Register - Flemington Car Sidings Signal Box
Address: Flemington Maintenance Centre, Bachell Avenue, Lidcombe, NSW 2141
Last Inspection: 18/02/2021

ASBESTOS ITEMS:
1. Level 1 balcony, north-eastern side: Wall corner strips (Moulded fibre cement). Condition: Good. Risk: Low.
2. Level 1, surrounding: Wall cladding (Fibre cement sheeting). Condition: Good. Risk: Low.
3. Level 1, toilet: Walls throughout (double skin) (Fibre cement sheeting). Condition: Good. Risk: Low.
4. Level 1, awning surrounding: Awning lining (Fibre cement sheeting). Condition: Good. Risk: Low.
5. Ground level, entrance foyer: Electrical switchbox (Bituminous backing board - presumed). Condition: Good. Risk: Low.

LEAD PAINT ITEMS:
1. Ground level, surrounding: Door/window upper and lower trim (Brown paint). 10.0% w/w. Condition: Fair. Risk: Low.
2. Ground level, west side: Awning timber framework (Cream paint). 0.21% w/w. Condition: Poor. Risk: Low. Action: Repair and seal.
3. Ground level, throughout: Walls (Pale blue paint). 6.6% w/w. Condition: Poor. Risk: Low. Action: Repair and seal.
4. Level 1, throughout: Walls (Yellow paint). 6.2% w/w. Condition: Good. Risk: Low.
5. Level 1, throughout: Windows and doors (White paint). 4.1% w/w. Condition: Fair. Risk: Low.
6. Level 1, surrounding: Walls and awning underside (Cream paint). 5.0% w/w. Condition: Poor. Risk: Low. Action: Repair and seal.
7. Ground level and level 1: Ceiling (White paint). 5.2% w/w. Condition: Poor. Risk: Low. Action: Repair and seal.

LEAD DUST:
1. Ground level, throughout: Floor (Accumulated dust and lead paint debris). Condition: Poor. Risk: Low. Action: Conduct risk assessment prior to works.

PCBs:
1. Ground level and level 1: Fluorescent lights (Capacitors - presumed). Condition: Good. Risk: Low. Action: Remove prior to replacement.

SMF:
None identified.

INACCESSIBLE AREAS:
- External east and south sides of signal box (Rail corridor)
- Old oil shed (Locked)
- Store building (Locked)
- Height restricted areas >2.7m
- Inside confined spaces
- Live mechanical/electrical plant and equipment
`;

const BASE_INSTRUCTION = `
You are the Flemington Signal Box Station HazMat Assistant. 
Your goal is to answer questions about hazardous materials at this site based ONLY on the provided register data.

HazMat Data:
${HAZMAT_DATA}
`;

const TECHNICAL_INSTRUCTION = `
Guidelines:
1. Be as brief as possible while providing the required information.
2. If a question is ambiguous or lacks detail (e.g., "where is the asbestos?"), ask for more detail (e.g., "Which level or specific area are you asking about?").
3. Only use the provided data. If information is not in the data, state that it's not recorded.
4. Always mention the risk status and condition if relevant to a specific item.
5. Remind users that inaccessible areas (like the Old oil shed or Rail corridor) must be presumed to contain asbestos until proven otherwise.
`;

const PLAIN_ENGLISH_INSTRUCTION = `
Persona: You are a health and safety professional with 30 years in the business.

Guidelines:
1. Deliver responses that are accurate but easily understood by a non-professional. Avoid dense jargon or explain it simply.
2. Explain the dangers of each substance mentioned.
3. Explain the dangers specifically in the context of the quantities and conditions indicated in the reports.
4. Advise on the best way to protect themselves for the levels indicated.
5. Only use the provided data for site facts. If information is not in the data, state that it's not recorded.
6. Remind users that inaccessible areas (like the Old oil shed or Rail corridor) must be presumed to contain asbestos until proven otherwise.
`;

export async function chatWithAssistant(
  message: string, 
  history: { role: "user" | "model"; parts: { text: string }[] }[] = [],
  responseStyle: "technical" | "plain" = "technical"
) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = "gemini-3-flash-preview";

  const systemInstruction = BASE_INSTRUCTION + (responseStyle === "plain" ? PLAIN_ENGLISH_INSTRUCTION : TECHNICAL_INSTRUCTION);

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: systemInstruction,
    },
    history: history,
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}
