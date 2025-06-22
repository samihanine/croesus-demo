"use client";

import { useState } from "react";
import { Input, Card, Titre, Paragraph, Button } from "../components";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const exemples = [
    {
      nom: "Exemple Croesus",
      url: "https://www.thewealthmosaic.com/vendors/croesus/news/croesus-renews-5-year-partnership-with-a-second-ca/",
    },
    {
      nom: "Exemple D-Wave",
      url: "https://www.forbes.com/sites/greatspeculations/2025/06/11/qbts-stock-whats-next-after-1350-rally/",
    },
    {
      nom: "Exemple Blackrock",
      url: "https://decrypt.co/325162/why-blackrock-ibit-bitcoin-etf-soaring",
    },
  ];

  const handleExemple = (exempleUrl: string) => {
    setUrl(exempleUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(
        `/api/analyze?url=${encodeURIComponent(url)}`
      );

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Invalid server response (JSON format expected)");
      }

      if (!response.ok) {
        throw new Error(data.error || "Error during analysis");
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100";
      case "negative":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Titre level={1}>NLP Company Analyzer</Titre>
          <Paragraph variant="muted" className="text-sm max-w-2xl mx-auto">
            Intelligent NLP tool that identifies companies mentioned in an
            article and determines whether the article speaks about them
            positively or negatively, using sentiment analysis (and no LLMs)
          </Paragraph>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="mb-8">
            <form onSubmit={handleSubmit}>
              <Input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                label="Article URL to analyze"
                required
              />

              <div className="mb-6">
                <Paragraph variant="small" className="font-medium mb-3">
                  Or try with an example:
                </Paragraph>
                <div className="flex flex-wrap gap-2">
                  {exemples.map((exemple, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="secondary"
                      onClick={() => handleExemple(exemple.url)}
                    >
                      {exemple.nom}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={!url.trim()}
                loading={loading}
                className="w-full"
              >
                {loading ? "Analysis in progress..." : "Analyze article"}
              </Button>
            </form>
          </Card>

          {error && (
            <Card className="bg-red-100 border border-red-400 text-red-700 mb-6">
              <Paragraph className="font-medium">❌ Error:</Paragraph>
              <Paragraph className="mt-2">{error}</Paragraph>
              <Paragraph variant="small" className="mt-3 text-red-600">
                Please check the article URL or try again later.
              </Paragraph>
            </Card>
          )}

          {results && (
            <Card>
              <Titre level={2}>Analysis Results</Titre>

              <div className="mb-8">
                <Titre level={3} className="text-gray-800">
                  Overall Article Sentiment
                </Titre>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${getSentimentColor(
                      results.sentiment
                    )} ${getSentimentBg(results.sentiment)}`}
                  >
                    {results.sentiment === "positive"
                      ? "😊 Positive"
                      : results.sentiment === "negative"
                      ? "😞 Negative"
                      : "😐 Neutral"}
                  </span>
                  <Paragraph variant="muted">
                    Confidence score: {results.score?.toFixed(2) || "N/A"}
                  </Paragraph>
                </div>
              </div>

              <div>
                <Titre level={3} className="text-gray-800">
                  Companies identified via Google Knowledge Graph (
                  {results.organizations?.length || 0})
                </Titre>
                {results.organizations && results.organizations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.organizations.map((org: string, index: number) => (
                      <div
                        key={index}
                        className="px-4 py-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-3 bg-[#E12C38]"></div>
                          <Paragraph className="font-medium">{org}</Paragraph>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Paragraph variant="muted" className="italic">
                    No companies identified in this article with sufficient
                    confidence level.
                  </Paragraph>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
