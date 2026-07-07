self.__BUILD_MANIFEST = {
  "__rewrites": {
    "afterFiles": [
      {
        "source": "/portal"
      },
      {
        "source": "/portal/:path*"
      },
      {
        "source": "/assets/:path*"
      },
      {
        "source": "/portal/favicon.ico"
      }
    ],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/_app",
    "/_error"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()