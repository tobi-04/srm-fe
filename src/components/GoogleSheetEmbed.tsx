import { Card } from "antd";

interface GoogleSheetEmbedProps {
  url: string;
}

/**
 * GoogleSheetEmbed Component
 *
 * Renders a Google Sheet in an iframe for direct viewing/editing
 * No Google Sheets API or OAuth required - just embed the sheet URL
 *
 * @param url - The Google Sheet URL to embed
 */
export default function GoogleSheetEmbed({ url }: GoogleSheetEmbedProps) {
  // Don't render if URL is empty
  if (!url) {
    return null;
  }

  return (
    <Card
      style={{
        marginTop: 24,
        overflow: "hidden",
      }}
      bodyStyle={{ padding: 0 }}>
      <iframe
        src={url}
        width="100%"
        height="800"
        frameBorder="0"
        style={{
          border: "none",
          display: "block",
        }}
        title="Google Sheet Embed"
      />
    </Card>
  );
}
