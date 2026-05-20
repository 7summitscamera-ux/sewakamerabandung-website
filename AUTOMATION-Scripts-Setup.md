# 🔧 STEP 2: AUTOMATION — Scripts & Tools Setup

## Overview
Automation untuk speed up repetitive tasks & reduce manual work.

---

# 1. SCHEMA GENERATOR SCRIPT (Node.js)

**File**: `schema-generator.js`  
**Purpose**: Auto-generate FAQ schema, LocalBusiness schema, Product schema  
**Time saved**: 5-10 minutes per page

```javascript
// schema-generator.js
// Usage: node schema-generator.js --type=faq --count=20

const fs = require('fs');
const args = process.argv.slice(2);

// FAQ Schema Generator
function generateFAQSchema(questions) {
  const faqItems = questions.map((q, i) => ({
    "@type": "Question",
    "name": q.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": q.answer
    }
  }));
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems
  };
}

// LocalBusiness Schema Generator
function generateLocalBusinessSchema(business) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "description": business.description,
    "url": business.url,
    "telephone": business.phone,
    "address": business.addresses.map(addr => ({
      "@type": "PostalAddress",
      "streetAddress": addr.street,
      "addressLocality": addr.city,
      "addressRegion": addr.region,
      "addressCountry": addr.country
    })),
    "openingHours": business.hours,
    "priceRange": business.priceRange,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": business.rating,
      "reviewCount": business.reviewCount
    },
    "sameAs": business.socialLinks,
    "geo": business.addresses.map(addr => ({
      "@type": "GeoCoordinates",
      "latitude": addr.lat,
      "longitude": addr.lng
    }))
  };
}

// Product Schema Generator
function generateProductSchema(product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "IDR",
      "lowPrice": product.minPrice,
      "highPrice": product.maxPrice,
      "offerCount": 1
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 4.9,
      "reviewCount": product.reviewCount || 100
    }
  };
}

// Export as JSON-LD
function outputSchema(schema, outputFile) {
  const jsonLD = `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>`;
  
  if (outputFile) {
    fs.writeFileSync(outputFile, jsonLD);
    console.log(`✅ Schema saved to ${outputFile}`);
  } else {
    console.log(jsonLD);
  }
}

// Main
const type = args.find(a => a.startsWith('--type='))?.split('=')[1] || 'faq';
const output = args.find(a => a.startsWith('--output='))?.split('=')[1];

if (type === 'faq') {
  const sampleFAQ = [
    {
      question: "Berapa harga sewa kamera di Bandung?",
      answer: "Mulai Rp 75.000/hari untuk action camera hingga Rp 1.000.000/hari untuk drone profesional."
    },
    // Add more FAQs...
  ];
  outputSchema(generateFAQSchema(sampleFAQ), output);
} else if (type === 'business') {
  const business = {
    name: "7summits Camera",
    description: "Platform sewa kamera profesional di Bandung",
    url: "https://sewakamerabandung.id",
    phone: "+6281121114410",
    rating: 5.0,
    reviewCount: 100,
    priceRange: "Rp75.000 - Rp1.000.000",
    hours: "Mo-Su 09:00-20:00",
    addresses: [
      {
        street: "Jl. Cisaranten",
        city: "Bandung",
        region: "Jawa Barat",
        country: "ID",
        lat: "-6.9267",
        lng: "107.6776"
      },
      {
        street: "Jl. Sriwijaya",
        city: "Bandung",
        region: "Jawa Barat",
        country: "ID",
        lat: "-6.8765",
        lng: "107.6234"
      }
    ],
    socialLinks: [
      "https://instagram.com/sewakamerabandung.id",
      "https://youtube.com/@7summitscamera",
      "https://maps.google.com/?q=7summits"
    ]
  };
  outputSchema(generateLocalBusinessSchema(business), output);
}
```

**Usage**:
```bash
node schema-generator.js --type=faq --output=schema-faq.json
node schema-generator.js --type=business --output=schema-business.json
```

---

# 2. INTERNAL LINK CHECKER (Python)

**File**: `link-checker.py`  
**Purpose**: Verify all internal links are correct, catch broken links  
**Time saved**: 30 minutes of manual checking

```python
#!/usr/bin/env python3
# link-checker.py
# Usage: python3 link-checker.py --domain=sewakamerabandung.id

import re
import requests
from urllib.parse import urljoin, urlparse
from collections import defaultdict

class LinkChecker:
    def __init__(self, domain):
        self.domain = domain
        self.links = defaultdict(list)
        self.broken = []
        
    def check_links(self, html_content, page_url):
        """Extract and check all links in HTML"""
        link_pattern = r'href=[\'"](.*?)[\'"]'
        matches = re.findall(link_pattern, html_content)
        
        for link in matches:
            full_url = urljoin(page_url, link)
            
            # Check if internal link
            if urlparse(full_url).netloc == self.domain:
                try:
                    response = requests.head(full_url, timeout=5)
                    if response.status_code >= 400:
                        self.broken.append({
                            'url': full_url,
                            'status': response.status_code,
                            'from': page_url
                        })
                    else:
                        self.links[page_url].append(full_url)
                except:
                    pass
    
    def report(self):
        """Generate link report"""
        print(f"\n📊 LINK REPORT FOR {self.domain}")
        print(f"Total internal links: {sum(len(v) for v in self.links.values())}")
        print(f"Broken links found: {len(self.broken)}")
        
        if self.broken:
            print("\n❌ BROKEN LINKS:")
            for b in self.broken:
                print(f"  - {b['url']} (Status: {b['status']}) from {b['from']}")
        else:
            print("\n✅ All links are working!")

# Usage
if __name__ == "__main__":
    import sys
    domain = next(a.split('=')[1] for a in sys.argv if '--domain=' in a)
    
    checker = LinkChecker(domain)
    # Add pages to check...
    checker.report()
```

---

# 3. SEO METADATA EXTRACTOR (JavaScript)

**File**: `extract-metadata.js`  
**Purpose**: Extract all meta tags, titles, descriptions for audit  
**Time saved**: 45 minutes manual compilation

```javascript
// extract-metadata.js
// Usage: npm install puppeteer && node extract-metadata.js

const puppeteer = require('puppeteer');
const fs = require('fs');

async function extractMetadata(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto(url);
  
  const metadata = await page.evaluate(() => {
    return {
      url: window.location.href,
      title: document.querySelector('title')?.textContent,
      description: document.querySelector('meta[name="description"]')?.content,
      og_title: document.querySelector('meta[property="og:title"]')?.content,
      og_description: document.querySelector('meta[property="og:description"]')?.content,
      og_image: document.querySelector('meta[property="og:image"]')?.content,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      h1: document.querySelector('h1')?.textContent,
      wordCount: document.body.innerText.split(/\s+/).length,
      images: Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt
      })),
      internalLinks: Array.from(document.querySelectorAll('a[href^="/"]')).map(a => ({
        url: a.href,
        text: a.textContent.trim()
      }))
    };
  });
  
  await browser.close();
  return metadata;
}

// Scan multiple pages
async function auditSite(urls) {
  const results = [];
  
  for (const url of urls) {
    console.log(`Scanning ${url}...`);
    const meta = await extractMetadata(url);
    results.push(meta);
  }
  
  // Export as CSV
  const csv = results.map(r => 
    `${r.url},"${r.title}","${r.description}",${r.wordCount}`
  ).join('\n');
  
  fs.writeFileSync('seo-audit.csv', csv);
  console.log('✅ Audit exported to seo-audit.csv');
}

// Usage
const sitePagesToAudit = [
  'https://sewakamerabandung.id',
  'https://sewakamerabandung.id/katalog',
  'https://sewakamerabandung.id/layanan',
  // Add more pages...
];

auditSite(sitePagesToAudit);
```

---

# 4. RANK TRACKING AUTOMATION (Python)

**File**: `rank-tracker.py`  
**Purpose**: Track keyword rankings automatically (daily)  
**Time saved**: 5 minutes daily manual checking

```python
#!/usr/bin/env python3
# rank-tracker.py
# Requires: pip install google-search-results

from serpapi import GoogleSearch
import csv
from datetime import datetime
import os

class RankTracker:
    def __init__(self, keywords, domain):
        self.keywords = keywords
        self.domain = domain
        self.results = []
    
    def track(self, api_key):
        """Track each keyword ranking"""
        for keyword in self.keywords:
            params = {
                "q": keyword,
                "api_key": api_key,
                "gl": "id",  # Indonesia
                "num": 100  # First 100 results
            }
            
            search = GoogleSearch(params)
            results = search.get_dict()
            
            # Find position of domain
            position = 0
            for i, result in enumerate(results.get('organic_results', [])):
                if self.domain in result['link']:
                    position = i + 1
                    break
            
            self.results.append({
                'keyword': keyword,
                'position': position if position > 0 else 'Not in Top 100',
                'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'url': result.get('link', 'N/A') if position > 0 else 'N/A'
            })
            
            print(f"✓ {keyword}: Rank #{position}")
    
    def save_to_csv(self, filename='rank_tracking.csv'):
        """Save results to CSV for historical tracking"""
        file_exists = os.path.isfile(filename)
        
        with open(filename, 'a', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['date', 'keyword', 'position', 'url'])
            
            if not file_exists:
                writer.writeheader()
            
            writer.writerows(self.results)
        
        print(f"✅ Saved to {filename}")

# Usage
if __name__ == "__main__":
    SERPAPI_KEY = "your_api_key_here"
    
    keywords_to_track = [
        "sewa kamera bandung",
        "rental kamera bandung",
        "sewa kamera dago",
        "sewa kamera wedding bandung",
        "sewa kamera untuk pemula",
    ]
    
    tracker = RankTracker(keywords_to_track, "sewakamerabandung.id")
    tracker.track(SERPAPI_KEY)
    tracker.save_to_csv()
```

**Setup Cron Job (Linux/Mac)**:
```bash
# Run daily at 8 AM
0 8 * * * /usr/bin/python3 /path/to/rank-tracker.py
```

---

# 5. CONTENT GENERATOR HELPER (Template Fill)

**File**: `article-generator.py`  
**Purpose**: Auto-fill article templates with data  
**Time saved**: 15-20 minutes per article

```python
#!/usr/bin/env python3
# article-generator.py

from datetime import datetime
import json

class ArticleGenerator:
    def __init__(self, topic_data):
        self.data = topic_data
    
    def generate(self):
        template = """# {title}

## Meta
- Title: {seo_title}
- Description: {meta_description}
- Keyword: {main_keyword}

## Introduction
{intro_text}

## Table of Contents
{toc}

## Main Content
{sections}

## FAQ
{faq_section}

## CTA
{cta}

## Internal Links
{internal_links}

## Word Count: {word_count}
## Published: {date}
"""
        
        article = template.format(
            title=self.data['title'],
            seo_title=self.data['seo_title'],
            meta_description=self.data['meta_description'],
            main_keyword=self.data['keyword'],
            intro_text=self.data['intro'],
            toc=self._generate_toc(),
            sections=self._generate_sections(),
            faq_section=self._generate_faq(),
            cta=self.data['cta'],
            internal_links=self._generate_links(),
            word_count=len(self.data.get('full_text', '').split()),
            date=datetime.now().strftime('%Y-%m-%d')
        )
        
        return article
    
    def _generate_toc(self):
        return '\n'.join([f"{i+1}. {h}" for i, h in enumerate(self.data['headings'])])
    
    def _generate_sections(self):
        return '\n\n'.join(self.data.get('sections', []))
    
    def _generate_faq(self):
        faq_items = []
        for q, a in self.data.get('faq', []):
            faq_items.append(f"**Q: {q}**\nA: {a}")
        return '\n\n'.join(faq_items)
    
    def _generate_links(self):
        links = []
        for label, url in self.data.get('internal_links', []):
            links.append(f"- [{label}]({url})")
        return '\n'.join(links)

# Usage
article_data = {
    'title': 'Sewa Kamera untuk Pemula: Panduan Step-by-Step',
    'seo_title': 'Sewa Kamera untuk Pemula: Panduan Lengkap 2026',
    'meta_description': 'Panduan lengkap sewa kamera untuk pemula — pilih gear, booking online, syarat, harga...',
    'keyword': 'sewa kamera untuk pemula',
    'intro': 'Ingin sewa kamera tapi bingkin gimana? Article ini bakal guide lengkap...',
    'headings': ['Berapa Harga?', 'Bagaimana Cara Booking?', 'Apa Syarat?'],
    'sections': ['Section 1 content...', 'Section 2 content...'],
    'faq': [
        ('Apakah perlu pengalaman?', 'Tidak, 7summits bakal guide setiap step...'),
        ('Berapa lama prosesnya?', 'Dari booking ke pickup: 5-10 menit...')
    ],
    'cta': 'Siap sewa? Chat WhatsApp sekarang...',
    'internal_links': [
        ('Panduan lengkap', '/sewa-kamera-bandung-panduan-lengkap'),
        ('Katalog equipment', '/katalog')
    ]
}

generator = ArticleGenerator(article_data)
article = generator.generate()
print(article)
```

---

# 6. GSC (Google Search Console) Monitoring

**Setup via Google Search Console UI** (no script needed):

1. **Create automated email reports**:
   - Settings → Email reports
   - Daily performance summary
   - Alerts for indexation issues

2. **Monitor key metrics**:
   - Impressions: Should increase week-over-week
   - Clicks: Should increase (tracking CTR)
   - Rankings: Monitor via GSC "Performance" tab

3. **Check weekly**:
   - New pages indexed
   - Crawl errors
   - Mobile usability issues
   - Core Web Vitals status

---

# SETUP CHECKLIST

- [ ] Clone/download schema-generator.js
- [ ] Install dependencies: `npm install puppeteer` (for link checker)
- [ ] Setup SerpAPI account for rank tracking (free tier available)
- [ ] Create cron job for daily rank tracking
- [ ] Add Python scripts to project /scripts folder
- [ ] Test link checker on 5-10 pages
- [ ] Verify GSC setup (if not already done)
- [ ] Create CSV for tracking results
- [ ] Setup Git ignore for sensitive API keys (.env file)

---

# TIME SAVED PER WEEK

| Task | Manual Time | Automated Time | Saved |
|------|------------|-----------------|-------|
| Schema generation (10 pages) | 40 min | 5 min | 35 min |
| Link checking (entire site) | 60 min | 10 min | 50 min |
| Metadata audit | 45 min | 5 min | 40 min |
| Rank tracking (5 keywords) | 15 min | 2 min | 13 min |
| **Total per week** | **160 min** | **22 min** | **138 min** |

**Weekly time saved**: ~2.3 hours (allows team to focus on content creation)

