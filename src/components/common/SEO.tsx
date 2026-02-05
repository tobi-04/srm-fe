import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterHandle?: string;
  noindex?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage,
  ogUrl,
  twitterHandle = "@srm_lesson",
  noindex = false,
}) => {
  const siteTitle = "SRM Lesson - Nền tảng học tập trực tuyến";
  const defaultDescription =
    "SRM Lesson cung cấp các khóa học chất lượng cao về tài chính, kinh doanh và phát triển cá nhân.";
  const defaultOgImage = "/og-image.jpg"; // Placeholder for default social image

  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaDescription = description || defaultDescription;
  const currentOgUrl = ogUrl || window.location.href;
  const currentOgImage = ogImage || defaultOgImage;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentOgUrl} />
      <meta property="og:image" content={currentOgImage} />
      <meta property="og:site_name" content="SRM Lesson" />

      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={currentOgImage} />

      {/* Additional SEO Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="UTF-8" />
    </Helmet>
  );
};

export default SEO;
