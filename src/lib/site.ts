export const siteConfig = {
  name: "Convertz",
  shortName: "Convertz",
  description:
    "Convert PDF, Word, Excel, images, and media files online with local-first processing. Fast, secure file conversion on Convertz by YESP Studio.",
  url: "https://convertz.yespstudio.com",
  ogImage: "https://convertz.yespstudio.com/opengraph-image",
  creator: "YESP Studio",
  xHandle: "@yespstudio",
  githubRepo: "https://github.com/srinithinsomasundaram/free-pdf-tools",
};

export const absoluteUrl = (path = "/") => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return new URL(path, siteConfig.url).toString();
};
