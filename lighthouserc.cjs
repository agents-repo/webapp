module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/about',
        'http://localhost:4173/contact',
        'http://localhost:4173/help-us',
        'http://localhost:4173/accessibility',
        'http://localhost:4173/privacy',
        'http://localhost:4173/privacidade',
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: '--no-sandbox --disable-setuid-sandbox --headless=new',
      },
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
}
