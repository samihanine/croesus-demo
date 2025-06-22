import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { LanguageServiceClient } from "@google-cloud/language";

const credentials = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
  universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
};

const nlp = new LanguageServiceClient({ credentials });

const KG_KEY = process.env.GOOGLE_KG_API_KEY!;
const KG_BASE = "https://kgsearch.googleapis.com/v1/entities:search";

function isOrganizationInArticle(
  organizationName: string,
  articleText: string
): boolean {
  const orgWords = organizationName.toLowerCase().split(/\s+/);
  const textLower = articleText.toLowerCase();
  return orgWords.some(
    (word: string) => word.length > 3 && textLower.includes(word)
  );
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url).searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing URL parameter" },
      { status: 400 }
    );
  }

  try {
    /* 1. Article */
    const html = await (await fetch(url)).text();
    const text = cheerio.load(html)("p").text();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Unable to extract article content" },
        { status: 400 }
      );
    }

    /* 2. Sentiment */
    const [ents] = await nlp.analyzeEntities({
      document: { content: text, type: "PLAIN_TEXT" },
      encodingType: "UTF8",
    });
    const [sent] = await nlp.analyzeSentiment({
      document: { content: text, type: "PLAIN_TEXT" },
    });
    const docScore = sent.documentSentiment?.score ?? 0;
    const docSent =
      docScore > 0.1 ? "positive" : docScore < -0.1 ? "negative" : "neutral";

    /* 3. Organizations */
    const organisations: string[] =
      ents.entities
        ?.filter((entity) => entity.salience && entity.salience > 0.005)
        .filter(
          (entity) => entity.type === "ORGANIZATION" || entity.type === "PERSON"
        )
        .filter((entity) => /^[A-Z]/.test(entity.name || ""))
        .filter((entity) => isOrganizationInArticle(entity.name || "", text))
        .sort((a, b) => (b.salience || 0) - (a.salience || 0))
        .map((entity) => entity.name || "") || [];

    const results: string[] = [];
    for (const organisation of organisations) {
      try {
        const kgUrl = `${KG_BASE}?query=${encodeURIComponent(
          organisation
        )}&key=${KG_KEY}&types=Organization&limit=3`;
        const kgResponse = await fetch(kgUrl);
        const kgData = (await kgResponse.json()) as {
          itemListElement: {
            result: { name: string };
          }[];
        };

        if (kgData.itemListElement && kgData.itemListElement.length > 0) {
          const kgResult = kgData.itemListElement[0].result.name;
          if (isOrganizationInArticle(kgResult, text)) {
            results.push(kgResult);
          }
        }
      } catch (kgError) {
        console.error(`Knowledge Graph error for ${organisation}:`, kgError);
      }
    }

    return NextResponse.json({
      organizations: [...new Set(results)],
      sentiment: docSent,
      score: docScore,
    });
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? `Analysis error: ${err.message}`
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}
