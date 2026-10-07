#!/usr/bin/env python3
"""
Blog migration: blog.peopleshr.com (WordPress) -> static pages on peopleshr.com.

Pulls every post from the WordPress REST API, plus each post's live <head>
(Rank Math's SEO title / description / robots), and writes one static page
per post in the site's own design:

    "Blog" category posts  -> blog/<slug>.html   (served at /blog/<slug>/)
    news / events posts    -> news/<slug>.html   (served at /news/<slug>/)

Slugs, SEO titles, meta descriptions, H1s, body copy and dates are kept
exactly as they are on WordPress, so the 301s from the old URLs pass on
the posts' rankings. Images the posts use are downloaded into uploads/
under the same YYYY/MM/ path WordPress used (wp-content/uploads/X ->
uploads/X), so old image URLs can be redirected with one rule.

On a full build (no slugs) it also writes the post cards into the listing
pages (blog/index.html, news/index.html, events.html, company.html) between
their <!-- POSTS:x START/END --> markers, and every post URL into
sitemap.xml's <!-- POSTS --> block.

Also writes, for the developer who owns .htaccess:
    tools/blog-migration/redirect-map.csv   old URL -> new URL (301)

Repo-only tool: deploy.sh excludes tools/. Needs BeautifulSoup:
    python3 -m venv .venv && .venv/bin/pip install beautifulsoup4
    .venv/bin/python tools/blog-migration/build.py [--refresh] [slug ...]

With slugs, only those posts are built (all posts are still fetched, for
link rewriting and related posts). --refresh re-downloads the WordPress
data instead of using the cache in tools/blog-migration/.cache/.
"""

import csv
import html
import json
import math
import os
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime

from bs4 import BeautifulSoup, Comment, NavigableString

WP = 'https://blog.peopleshr.com'
SITE = 'https://peopleshr.com'
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '.cache')

BLOG_CAT = 18  # WordPress "Blog" category; everything else is news/events

# Webinars live on the webinars page now, not on YouTube or the old
# WordPress registration pages.
WEBINARS = '/webinars/'
WEBINAR_LINKS = {
    'https://www.youtube.com/watch?v=cAbGKlIRjkQ',  # "How HRIS Analytics Drives Smarter Decisions" recording (what-is-an-hris)
}
WEBINAR_PATH = re.compile(r'^/(webinar|event-registration)[\w-]*/?$')
# Old WordPress pages with no page of the same name on the main site:
# retired, and their old URL redirects to the closest page (all confirmed
# 2026-10-07; REMOVED_PAGES below holds the ones retired one by one).
PAGE_FALLBACKS = {
    'webinar-the-everywhere-workforce': '/webinars/',  # retired webinar page; recording is on /webinars/
    'webinar-registration': '/webinars/',
    'webinar-registration-facebook': '/webinars/',
    'webinar-registration-peopleshr-2026-02': '/webinars/',
    'event-registration': '/events/',
    'public-sector': '/solutions/public-sector/',
    'home': '/', 'home-peopleshr-x': '/', 'new-in-001': '/', 'test-0002': '/', 'logos': '/',
    'hello-middle-east': '/middle-east/',
    'philippines-hris-lp': '/philippines-hris/',
    'hrsoftwareguide-id': '/hr-ebooks-and-guides/',
    'cheatsheet-payroll': '/hr-ebooks-and-guides/',
    'the-ultimate-hris-pitch-deck-for-hr-leaders': '/hr-ebooks-and-guides/',
    'talent-acquisition-journey-map': '/products/talent-acquisition/',
    'payroll-quiz': '/products/payroll-system/',
}
# Typos in the WordPress copy, fixed on the way over (slugs stay as they
# are, since they are the URLs). TEXT_FIXES change words in the text before
# headings get their anchor ids; HTML_FIXES change the finished body HTML
# (duplicated paragraphs, run-together list items). A fix that no longer
# matches is reported, so edits made on WordPress later don't go unnoticed.
TEXT_FIXES = {
    'what-is-an-hris': [
        ('HR i can minimize', 'HR can minimize'),
        ('cost-effective an a great', 'cost-effective and a great'),
        ('HR Sofware', 'HR Software'),
    ],
    'best-hr-software-in-uae': [
        ('from right from employee onboarding onboarding to offboarding', 'right from employee onboarding to offboarding'),
        ('Muti-country', 'Multi-country'),
        ('. Yomly: Intuitive', '8. Yomly: Intuitive'),
        ('Payroll made asy', 'Payroll Made Easy'),
        ('Middle East Complient', 'Middle East Compliant'),
    ],
    'hr-metrics-that-matter-in-2025': [
        (" umber of overtime hours worked by employees during a designated period. You can calculate an average "
         "number of overtime hours or analyse the data on an individual employee basis. This metric helps assess "
         "workload distribution, potential burnout risks, and the need for resource allocation adjustments.", ''),
    ],
    'moonlighting-and-why-hr-gurus-and-managers-refuse-to-greenlight-it': [
        ('achievetheir', 'achieve their'),
        ('employeedevelopment', 'employee development'),
        ('andpromote', 'and promote'),
    ],
    'need-real-proof-that-your-employees-are-happy': [('localised for upto 16+ languages', 'localised for 16+ languages')],
    'payroll-outsourcing-taking-the-pain-out-of-payday': [('apersonal', 'a personal')],
    'how-to-train-employees-handbook-new-normal-edition-with-reasons-solutions': [('jobfit', 'job-fit')],
}
# Posts not migrated: slug -> the post its old URLs redirect to instead.
REMOVED_POSTS = {
    # Word-for-word copy of the UAE guide, published under the "data-driven HR"
    # title and filed under Events (the real data-driven article is ...-2).
    'data-driven-hr-decisions-for-mid-sized-companies': 'how-to-choose-right-hr-payroll-software-uae',
    # Published 28 Oct 2020 under the L&D title but with the offboarding article's
    # text (Wayback Machine: the same since its first snapshot); no L&D text exists.
    'bursting-the-stereotypical-ld-bubbles': 'the-last-impression-matters-too',
}
TITLE_FIXES = {}
CATEGORY_FIXES = {}

HTML_FIXES = {
    'what-is-an-hris': [
        ('and save costs. Improved Regulatory Compliance: Track certifications',
         'and save costs.</li>\n<li><strong>Improved Regulatory Compliance: </strong>Track certifications'),
    ],
    'best-hr-software-in-uae': [
        ('alt="zimyo hr software" decoding="async" height="170" loading="lazy" src="/uploads/2026/01/factoHR_Logo.webp"',
         'alt="factoHR hr software" decoding="async" height="170" loading="lazy" src="/uploads/2026/01/factoHR_Logo.webp"'),
    ],
}
# Paragraphs/sentences pasted twice on WordPress: keep the first copy only.
# (For hrs-role-..., the stray early copy sits in the intro, so keep the
# second: listed as ('last', text).)
DUPLICATES = {
    'hr-metrics-that-matter-in-2025': [
        ('first', '<p><strong>Voluntary Turnover Rate </strong>: Calculate the turnover rate for employees who leave '
                  'your organization voluntarily, allowing you to assess voluntary attrition and potentially address '
                  'underlying concerns.</p>\n'),
        ('first', '<div class="bp-callout">\n<p><strong>Utilize HR software: </strong></p>\n<p>Invest in HR software '
                  'platforms that streamline data collection, organization, and analysis, making it more efficient and '
                  'accurate.</p>\n</div>\n'),
        ('first', "<p><strong>Track the Percentage of vacation days used </strong>: The percentage of vacation days "
                  "that employees take within a year is a helpful way to spot burnout and see how well they're "
                  "balancing work and personal life.</p>\n"),
    ],
    'hrs-role-in-making-the-workplace-a-bully-free-zone-hsenidbiz-blog': [
        ('last', '<p>The most obvious effect will be that it will lower the spirits of the employees. Maybe you were '
                 'looking forward to working for a certain company, but now you won’t be able to enjoy your '
                 'experience because of that one person in your office.</p>\n'),
    ],
    'is-your-technology-skills-ready-for-tomorrows-hr': [
        ('first', '<p>The recent events have forced many organisations to work remotely and has acted as a catalyst to '
                  'accelerate digital transformation. Now is the time to ensure your HR team is equipped to lead '
                  'further changes today, in order to be ready for the challenges of tomorrow and ensure your '
                  'organisation can adapt, and be resilient and brisk.</p>\n'),
    ],
}
for _slug in ('the-last-impression-matters-too',):
    DUPLICATES[_slug] = [
        ('first', '<p>This final impression can be tricky to make, with multiple statutory requirements that need to '
                  'be tackled by HR before the employee bids his final goodbye. Here’s how PeoplesHR can help you '
                  'make a lasting final impression.</p>\n'),
    ]

# Old WordPress pages deliberately not migrated (confirmed): slug -> where
# their old URL redirects.
REMOVED_PAGES = {
    'middle-east-hris-lp': '/middle-east/',  # incomplete template page
    'solving-enterprise-hr-challenges-in-the-hospitality-industry': '/solutions/hr-software-for-hospitality-industry/',  # retired content page
}

# Pages served by .htaccess rules rather than an .html file.
HTACCESS_PAGES = {'limitations-for-configuration', 'report'}

WEBINAR_PHRASE = re.compile(r'\bour webinar recording\b', re.I)
UA = {'User-Agent': 'Mozilla/5.0 (PeoplesHR blog migration)'}


# ----------------------------------------------------------------- fetching

def http_get(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if binary else data.decode('utf-8')


def cached(name, fetch, refresh):
    path = os.path.join(CACHE, name)
    if refresh or not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        data = fetch()
        with open(path, 'w', encoding='utf-8') as f:
            f.write(data)
    with open(path, encoding='utf-8') as f:
        return f.read()


def load_posts(refresh):
    def fetch():
        posts, page = [], 1
        while True:
            batch = json.loads(http_get(
                f'{WP}/wp-json/wp/v2/posts?per_page=100&page={page}&_embed=wp:featuredmedia,wp:term'))
            posts += batch
            if len(batch) < 100:
                return json.dumps(posts)
            page += 1
    return json.loads(cached('posts.json', fetch, refresh))


def load_head(post, refresh):
    """Rank Math's SEO tags, read from the live post's <head>."""
    page = cached(f"html/{post['slug']}.html", lambda: http_get(post['link']), refresh)
    head = page[:page.find('</head>')]

    def meta(attr, name):
        m = re.search(r'<meta %s="%s" content="([^"]*)"' % (attr, re.escape(name)), head)
        return html.unescape(m.group(1)) if m else ''

    title = re.search(r'<title>(.*?)</title>', head, re.S)
    return {
        'title': re.sub(r'\s+', ' ', html.unescape(title.group(1))).strip() if title else '',
        'description': meta('name', 'description'),
        'robots': meta('name', 'robots'),
        'og_image_alt': meta('property', 'og:image:alt'),
    }


# ------------------------------------------------------------ URL rewriting

def load_htaccess_redirects():
    """Exact-match 301s from the repo .htaccess (old page path -> new path),
    so links in post bodies can point straight at the final URL."""
    rules = {}
    with open(os.path.join(ROOT, '.htaccess'), encoding='utf-8', errors='replace') as f:
        for line in f:
            m = re.match(r'RewriteRule \^([\w\-/]+?)(?:\(\\\.html\)\?)?/\?\$ (\S+) \[R=30[12]', line.strip())
            if m:
                rules[m.group(1).strip('/')] = m.group(2)
    return rules


class Rewriter:
    def __init__(self, posts):
        self.post_url = {p['slug']: p['new_path'] for p in posts}
        self.redirects = load_htaccess_redirects()
        self.images = {}  # wp-content path -> local /uploads/ path

    def page_path(self, path):
        """Follow .htaccess redirect chains to the final local path."""
        slug = path.strip('/')
        if slug in self.post_url:
            return self.post_url[slug]
        seen = set()
        while slug in self.redirects and slug not in seen:
            seen.add(slug)
            target = self.redirects[slug]
            if target.startswith('http'):
                break
            slug = target.strip('/')
            if slug in self.post_url:
                return self.post_url[slug]
        slug = re.sub(r'\.html$', '', slug)
        return '/' + slug + '/' if slug else '/'

    def url(self, url):
        if not url:
            return url
        if url in WEBINAR_LINKS:
            return WEBINARS
        u = urllib.parse.urlsplit(url)
        host = (u.netloc or '').lower()
        if host and host not in ('peopleshr.com', 'www.peopleshr.com', 'blog.peopleshr.com',
                                 'dev.peopleshr.com', 'dev1.peopleshr.com'):
            return url
        if not host and not u.path.startswith('/'):
            return url  # "#anchor", "mailto:" etc.
        path = u.path
        if WEBINAR_PATH.match(path):
            return WEBINARS
        if '/wp-content/uploads/' in path or path.startswith('/uploads/'):
            return self.image(path)
        new = self.page_path(path)
        return new + (('#' + u.fragment) if u.fragment else '')

    def image(self, path):
        rel = re.sub(r'^.*?/(?:wp-content/)?uploads/', '', urllib.parse.unquote(path))
        local = '/uploads/' + rel
        self.images[rel] = local
        return urllib.parse.quote(local)

    def download_images(self):
        missing = 0
        for rel in sorted(self.images):
            dest = os.path.join(ROOT, 'uploads', rel)
            if os.path.exists(dest):
                continue
            try:
                data = http_get(f'{WP}/wp-content/uploads/' + urllib.parse.quote(rel), binary=True)
            except Exception as e:  # noqa: BLE001 -- report and keep going
                print(f'  ! image not downloaded: {rel} ({e})')
                missing += 1
                continue
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, 'wb') as f:
                f.write(data)
            print(f'  + uploads/{rel}')
        return missing


# ---------------------------------------------------------- content cleanup

KEEP_ATTRS = {
    'a': ['href', 'title'],
    'img': ['src', 'alt', 'width', 'height'],
    'td': ['colspan', 'rowspan'],
    'th': ['colspan', 'rowspan', 'scope'],
    'ol': ['start', 'type'],
}
BLOCK_TAGS = ['h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'table', 'figure', 'blockquote', 'pre', 'hr']


def slugify(text):
    s = re.sub(r'[^\w\s-]', '', text.lower()).strip()
    return re.sub(r'[\s_-]+', '-', s)[:60].strip('-') or 'section'


def convert_widget(w, soup):
    """Replace one Elementor widget with plain semantic HTML (or nothing)."""
    kind = w.get('data-widget_type', '').split('.')[0]
    box = w.select_one('.elementor-widget-container') or w

    if kind in ('spacer', 'divider', 'pix-img'):
        return []
    if kind == 'author-box':
        # Press releases end with an "About PeoplesHR" boilerplate box.
        name = box.select_one('.elementor-author-box__name')
        bio = box.select_one('.elementor-author-box__bio')
        out = []
        if name and name.get_text(strip=True):
            h = soup.new_tag('h2')
            h.string = name.get_text(' ', strip=True)
            out.append(h)
        if bio:
            out += list(bio.contents)
        return out
    if kind == 'table-of-contents':
        return [soup.new_tag('phr-toc')]  # filled in from the headings later
    if kind == 'ld_table' and looks_like_toc(box):
        return [soup.new_tag('phr-toc')]
    if kind in ('heading', 'hub_fancy_heading'):
        el = box.find(re.compile(r'^(h[1-6]|p|div|span)$'), class_=re.compile('heading-title|ld-fh-element'))
        if not el:
            return []
        if el.name == 'h1':
            el.name = 'h2'  # the page template owns the one H1
        if el.name in ('div', 'span'):
            el.name = 'p'
        return [el]
    if kind in ('ld_button', 'button'):
        a = box.find('a')
        if not a or a.get('href') in (None, '', '#'):
            return []  # e.g. "Download Cheatsheet" buttons that never linked anywhere
        btn = soup.new_tag('p', attrs={'class': 'bp-cta-link'})
        link = soup.new_tag('a', href=a['href'])
        link.string = a.get_text(' ', strip=True)
        btn.append(link)
        return [btn]
    if kind == 'ld_icon_box':
        contents = box.select_one('.contents') or box
        out = soup.new_tag('div', attrs={'class': 'bp-callout'})
        for child in contents.find_all(['p', 'h3', 'h4', 'ul'], recursive=False):
            if 'lqd-iconbox-heading' in (child.get('class') or []):
                child.name = 'strong'
                p = soup.new_tag('p')
                p.append(child)
                out.append(p)
            else:
                out.append(child)
        return [out]
    if kind == 'icon-list':
        ul = soup.new_tag('ul')
        for item in box.select('.elementor-icon-list-text'):
            li = soup.new_tag('li')
            for c in list(item.contents):
                li.append(c)
            ul.append(li)
        return [ul]
    if kind in ('ld_fancy_image', 'image'):
        img = box.find('img')
        return [img] if img else []
    # text-editor and anything unknown: keep the inner content. Older posts
    # put each paragraph in its own widget as bare text (no <p>), so loose
    # text is wrapped here, per widget, before the widgets are joined up.
    box.smooth()
    merge_inline_runs(box, soup, INLINE_TAGS + ('span', 'b', 'i', 'font', 'mark', 'small'))
    for br in box.find_all('phr-break'):
        br.replace_with(' ')
    return list(box.contents)


def looks_like_toc(box):
    cells = [td.get_text(' ', strip=True) for td in box.find_all('td')]
    return len(cells) >= 3 and sum(bool(re.match(r'^\d+\.', c)) for c in cells) >= len(cells) - 1


def fix_text(body, slug):
    """TEXT_FIXES for this post, plus a missing space after a full stop or
    comma ("costs.Improved", "payroll,which") anywhere outside links."""
    fixes = list(TEXT_FIXES.get(slug, []))
    used = set()
    body.smooth()
    for node in list(body.find_all(string=True)):
        if node.find_parent(['a', 'pre', 'code']) is not None:
            continue
        text = str(node).replace('\xa0', ' ')  # later cleanup does this anyway
        for old, new in fixes:
            if old in text:
                text = text.replace(old, new)
                used.add(old)
        text = re.sub(r'(?<=[a-z]{2}[.!?])(?=[A-Z][a-z])', ' ', text)
        text = re.sub(r'(?<=[a-z]{3},)(?=[a-z]{3})', ' ', text)
        if text != str(node):
            node.replace_with(NavigableString(text))
    for old, _ in fixes:
        if old not in used:
            print(f'  ! {slug}: text fix no longer matches: {old[:50]!r}')


def fix_html(out, slug):
    for old, new in HTML_FIXES.get(slug, []):
        if old not in out:
            print(f'  ! {slug}: HTML fix no longer matches: {old[:50]!r}')
        out = out.replace(old, new)
    for keep, dup in DUPLICATES.get(slug, []):
        if out.count(dup) < 2:
            print(f'  ! {slug}: duplicate no longer found: {dup[:50]!r}')
            continue
        if keep == 'first':
            i = out.index(dup) + len(dup)
            out = out[:i] + out[i:].replace(dup, '', 1)
        else:
            out = out.replace(dup, '', 1)
    return out


def clean_content(raw, rw, slug=''):
    # A blank line in bare text is a paragraph break (WordPress's autop);
    # mark it before parsing, since the parser folds the whitespace away.
    raw = re.sub(r'(?<=[^\s>])\s*\n[ \t]*\n\s*(?=\S)|(?<=>)[ \t]*\n[ \t]*\n\s*(?=<(?:span|a|strong|b|em|i)\b)',
                 '<phr-break></phr-break>', raw)
    soup = BeautifulSoup(raw, 'html.parser')
    for c in soup.find_all(string=lambda s: isinstance(s, Comment)):
        c.extract()
    for t in soup.find_all(['script', 'style', 'noscript', 'svg', 'form', 'iframe', 'button']):
        t.decompose()

    # Lazy-loaded images keep the real URL in data-src.
    for img in soup.find_all('img'):
        real = img.get('data-src') or img.get('data-lazy-src') or img.get('src', '')
        if real.startswith('data:'):
            img.decompose()
            continue
        img['src'] = real

    # Elementor's responsive copies: anything hidden on desktop is a
    # duplicate of content shown there (or was switched off entirely).
    for t in soup.select('.elementor-hidden-desktop'):
        t.decompose()

    # Elementor widgets -> plain HTML, in document order.
    body = soup.new_tag('div')
    for w in soup.select('[data-widget_type]'):
        if w.find_parent(attrs={'data-widget_type': True}):
            continue
        for node in convert_widget(w, soup):
            body.append(node.extract() if hasattr(node, 'extract') else node)
    if not soup.select('[data-widget_type]'):  # plain (non-Elementor) post
        for node in list((soup.body or soup).contents):
            body.append(node.extract())

    # <pre> wrapped around images or blocks is a WordPress editor artifact.
    for pre in body.find_all('pre'):
        if pre.find(['img', 'figure', 'p', 'ul', 'ol', 'table', 'div']):
            pre.unwrap()

    # Leftover blank-line markers: split the paragraph there, or just space.
    for br in body.find_all('phr-break'):
        parent = br.parent
        if parent is not None and parent.name == 'p':
            tail = soup.new_tag('p')
            for sib in list(br.next_siblings):
                tail.append(sib.extract())
            parent.insert_after(tail)
        br.replace_with(' ')

    # Unwrap layout wrappers and inline noise, keep semantic tags.
    for t in body.find_all(['div', 'section', 'span', 'font', 'article', 'footer', 'center']):
        if t.name == 'div' and 'bp-callout' in (t.get('class') or []):
            continue
        t.unwrap()
    for t in body.find_all('b'):
        t.name = 'strong'
    for t in body.find_all('i'):
        t.name = 'em'
    for t in body.find_all('h1'):
        t.name = 'h2'

    flatten_lists(body)

    # Strip attributes except the few that carry meaning.
    for t in body.find_all(True):
        if t.name in ('phr-toc',):
            continue
        keep = KEEP_ATTRS.get(t.name, [])
        cls = [c for c in (t.get('class') or []) if c.startswith('bp-')]
        t.attrs = {k: v for k, v in t.attrs.items() if k in keep}
        if cls:
            t['class'] = cls

    # Bold inside headings is redundant (headings are already bold).
    for h in body.find_all(re.compile(r'^h[2-6]$')):
        for t in h.find_all(['strong', 'em']):
            t.unwrap()

    # A link around an image that only opens the image file itself.
    for a in body.find_all('a'):
        img = a.find('img')
        if img and not a.get_text(strip=True) and re.search(r'\.(webp|png|jpe?g|gif|svg)$', a.get('href', ''), re.I):
            a.unwrap()

    # Links and images -> new URLs.
    for a in body.find_all('a'):
        href = a.get('href', '')
        if not href or href == '#':
            a.unwrap()
            continue
        new = rw.url(href)
        a['href'] = new
        if new.startswith('http') and 'peopleshr.com' not in urllib.parse.urlsplit(new).netloc:
            a['target'] = '_blank'
            a['rel'] = 'noopener'
    for img in body.find_all('img'):
        img['src'] = rw.url(img['src'])
        img['loading'] = 'lazy'
        img['decoding'] = 'async'
        img['alt'] = re.sub(r'\s+', ' ', img.get('alt') or '').strip()
        while img.parent.name in ('p', 'a') and not img.parent.get_text(strip=True) and img.parent is not body:
            if img.parent.name == 'a':
                break  # linked image: keep the link, wrap the whole link in the figure
            img.parent.unwrap()
        target = img.parent if img.parent.name == 'a' and not img.parent.get_text(strip=True) else img
        if target.parent.name != 'figure':
            target.wrap(soup.new_tag('figure'))
        fig = target.parent
        if fig.parent.name == 'p' and not fig.parent.get_text(strip=True):
            fig.parent.unwrap()
    for fig in body.find_all('figure'):
        if not fig.find('img'):
            fig.decompose()

    link_webinar_mentions(body, soup)

    # Tables scroll sideways on phones instead of stretching the page.
    for table in body.find_all('table'):
        table.wrap(soup.new_tag('div', attrs={'class': 'bp-table'}))

    # Empty paragraphs / &nbsp; spacers / stray <br> at block edges.
    for t in body.find_all(['p', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'strong', 'em']):
        if not t.get_text(strip=True).replace('\xa0', '') and not t.find('img'):
            t.decompose()
    for br in body.find_all('br'):
        prev = br.previous_sibling
        nxt = br.next_sibling
        if br.parent.name in ('p', 'li', 'td') and (
                not br.parent.get_text(strip=True) or
                br.parent.contents[0] is br or br.parent.contents[-1] is br):
            br.decompose()
        elif prev is None or nxt is None:
            br.decompose()

    merge_adjacent_lists(body)

    # Text and inline elements left loose at the top level (from unwrapped
    # divs/spans, e.g. an Elementor drop cap "<span>M</span><span>anaging")
    # -> one paragraph per run.
    body.smooth()
    merge_inline_runs(body, soup)

    # Heading levels: posts must start at h2 under the page's h1.
    levels = sorted({int(h.name[1]) for h in body.find_all(re.compile(r'^h[2-6]$'))})
    if levels and levels[0] > 2:
        shift = levels[0] - 2
        for h in body.find_all(re.compile(r'^h[2-6]$')):
            h.name = 'h%d' % max(2, int(h.name[1]) - shift)

    fix_text(body, slug)

    # "Table of Contents" labels the old pages typed above their TOC.
    for toc in body.find_all('phr-toc'):
        prev = toc.find_previous_sibling()
        if prev is not None and re.match(r'^\s*table of contents?\s*$', prev.get_text(), re.I):
            prev.decompose()

    # A heading that only introduces a button ("Experience PeoplesHR today.")
    # is a call to action, not a section: keep it out of the outline.
    for btn in body.find_all('p', class_='bp-cta-link'):
        prev = btn.find_previous_sibling()
        if prev is not None and re.match(r'^h[2-6]$', prev.name):
            prev.name = 'p'
            prev['class'] = ['bp-cta-lead']

    # Anchor ids on h2s (for the table of contents and deep links).
    used = set()
    for h in body.find_all('h2'):
        hid = slugify(h.get_text(' ', strip=True))
        while hid in used:
            hid += '-2'
        used.add(hid)
        h['id'] = hid

    tocs = body.find_all('phr-toc')
    h2s = body.find_all('h2')
    for i, toc in enumerate(tocs):
        if i or len(h2s) < 3:
            toc.decompose()
            continue
        # A <div>, not <nav>: styles.css has a bare nav{} rule for the old navbar.
        nav = soup.new_tag('div', attrs={'class': 'bp-toc', 'role': 'navigation', 'aria-label': 'Table of contents'})
        title = soup.new_tag('p', attrs={'class': 'bp-toc-title'})
        title.string = 'Table of Contents'
        nav.append(title)
        # Headings that already carry their own numbers ("1. PeoplesHR")
        # get an unnumbered list, so the TOC doesn't read "2. 1. PeoplesHR".
        numbered = any(re.match(r'^\d+[.)]', h.get_text(strip=True)) for h in h2s)
        ol = soup.new_tag('ul' if numbered else 'ol')
        if numbered:
            nav['class'] = ['bp-toc', 'bp-toc--plain']
        for h in h2s:
            li = soup.new_tag('li')
            a = soup.new_tag('a', href='#' + h['id'])
            a.string = h.get_text(' ', strip=True)
            li.append(a)
            ol.append(li)
        nav.append(ol)
        toc.replace_with(nav)

    for node in body.find_all(string=True):
        if node.parent.name == 'pre':
            continue
        node.replace_with(re.sub(r'\s+', ' ', str(node)))
    for t in body.find_all(['p', 'li', 'td', 'th', 'h2', 'h3', 'h4', 'h5', 'h6', 'figcaption']):
        if t.contents and isinstance(t.contents[0], NavigableString):
            t.contents[0].replace_with(t.contents[0].lstrip())
        if t.contents and isinstance(t.contents[-1], NavigableString):
            t.contents[-1].replace_with(t.contents[-1].rstrip())

    out = body.decode_contents()
    out = re.sub(r'\n\s*\n+', '\n', out)
    for tag in BLOCK_TAGS + ['li', 'nav', 'div', 'tr']:
        out = re.sub(r'\s*(<%s[\s>])' % tag, r'\n\1', out)
        out = re.sub(r'(</%s>)\s*' % tag, r'\1\n', out)
    return fix_html(out.strip(), slug)


def flatten_lists(body):
    """WordPress's list block sometimes wraps each item in its own bullet-less
    <li style="list-style-type:none"><ul>...</ul></li>; lift the inner items
    out so they render as one normal list."""
    for li in body.find_all('li'):
        if li.parent is None:
            continue
        kids = [c for c in li.contents if not (isinstance(c, NavigableString) and not c.strip())]
        if kids and all(getattr(c, 'name', None) in ('ul', 'ol') for c in kids):
            items = [item.extract() for lst in kids for item in lst.find_all('li', recursive=False)]
            for item in items:
                li.insert_before(item)
            li.decompose()
    for lst in body.find_all(['ul', 'ol']):
        if not lst.find('li'):
            lst.decompose()


def merge_adjacent_lists(body):
    """Consecutive lists of the same type (split apart by the editor) -> one."""
    for lst in body.find_all(['ul', 'ol']):
        if lst.parent is None:
            continue
        nxt = lst.find_next_sibling()
        while nxt is not None and nxt.name == lst.name and not nxt.get('class') and not lst.get('class'):
            if any(isinstance(n, NavigableString) and n.strip() for n in iter_between(lst, nxt)):
                break
            for item in nxt.find_all('li', recursive=False):
                lst.append(item.extract())
            nxt.decompose()
            nxt = lst.find_next_sibling()


def iter_between(a, b):
    n = a.next_sibling
    while n is not None and n is not b:
        yield n
        n = n.next_sibling


def link_webinar_mentions(body, soup):
    """Turn "our webinar recording" in the copy into a link to the
    webinars page (only where it isn't linked already)."""
    for node in body.find_all(string=WEBINAR_PHRASE):
        if node.find_parent('a'):
            continue
        m = WEBINAR_PHRASE.search(node)
        a = soup.new_tag('a', href=WEBINARS)
        a.string = m.group(0)
        node.replace_with(node[:m.start()], a, node[m.end():])
    # A linked image with no alt text gives the link no name.
    for a in body.find_all('a', href=WEBINARS):
        img = a.find('img')
        if img is not None and not img.get('alt'):
            img['alt'] = 'Watch the webinar recording'


INLINE_TAGS = ('a', 'strong', 'em', 'br', 'sup', 'sub', 'u', 'code', 'img')


def merge_inline_runs(body, soup, inline=INLINE_TAGS):
    """Group each run of loose top-level text and inline elements into a <p>."""
    run = []

    def flush():
        if any((n.strip() if isinstance(n, NavigableString) else True) for n in run):
            p = soup.new_tag('p')
            run[0].insert_before(p)
            for n in run:
                p.append(n.extract())
        else:
            for n in run:
                n.extract()
        run.clear()

    for node in list(body.contents):
        name = getattr(node, 'name', None)
        if isinstance(node, NavigableString) or name in inline:
            run.append(node)
        else:
            flush()
    flush()


# ------------------------------------------------------------ page template

def site_chrome():
    """Navbar and footer are copied into every page on this site, so take
    them from the live blog listing page to stay in sync with it."""
    src_file = os.path.join(ROOT, 'blog', 'index.html')
    if not os.path.exists(src_file):
        src_file = os.path.join(ROOT, 'blog.html')
    with open(src_file, encoding='utf-8') as f:
        src = f.read()
    nav = src[src.index('<div class="nv-root">'):src.index('<!-- end of navbar -->') + len('<!-- end of navbar -->')]
    foot = src[src.index('<!-- footer start -->'):src.index('<!-- footer end -->') + len('<!-- footer end -->')]
    return nav, foot


def esc(s):
    return html.escape(s, quote=True)


def fmt_date(iso):
    return datetime.fromisoformat(iso).strftime('%B %-d, %Y')


def iso_utc(iso):
    return iso + '+00:00'


def read_minutes(content_html):
    words = len(re.sub(r'<[^>]+>', ' ', content_html).split())
    return max(1, math.ceil(words / 220))


def card_html(p, i, rw, indent='      ', hidden=False):
    """One post card, same markup the old WordPress-API listing scripts built
    (.cs-card from the success-stories grid)."""
    img = p['featured']
    # Sizing (whole image, 5:3) lives in css/post-cards.css (.cs-img--post).
    style = f" style=\"background-image:url('{esc(rw.image(img['card']))}');\"" if img else ''
    empty = '' if img else ' cs-img--empty'
    hide = ' style="display:none;"' if hidden else ''
    return (
        f'{indent}<div class="cs-card"{hide}>\n'
        f'{indent}  <div class="cs-img cs-img-{i % 3 + 1} cs-img--post{empty}"{style}></div>\n'
        f'{indent}  <div class="cs-content">\n'
        # Category label above the title (.cs-company, as on the case-study
        # cards) rather than over the image, where it covered image text.
        f'{indent}    <p class="cs-company">{esc(p["tag"].upper())}</p>\n'
        f'{indent}    <h3>{esc(p["title"])}</h3>\n'
        f'{indent}    <p>{esc(p["excerpt"])}</p>\n'
        f'{indent}    <a href="{p["new_path"]}" class="read-more">Read More &rarr;</a>\n'
        f'{indent}  </div>\n'
        f'{indent}</div>')


def related_cards(post, posts, rw):
    same = [p for p in posts if p['section'] == post['section'] and p['slug'] != post['slug']]
    same.sort(key=lambda p: p['date'], reverse=True)
    return '\n'.join(card_html(p, i, rw) for i, p in enumerate(same[:3]))


# Listing pages: (file, marker, WordPress category id, max cards, cards per "Load More")
LISTINGS = [
    ('blog/index.html', 'blog', 18, None, 6),
    ('news/index.html', 'news', 19, None, 6),
    ('events.html', 'events', 1, None, 6),
    ('company.html', 'company-news', 19, 3, None),
]


def write_listings(posts, rw):
    """Write the post cards into each listing page's <!-- POSTS:x --> block,
    as plain HTML so crawlers see a link to every post. Cards past the first
    page are hidden until "Load More" (js/post-list.js) shows them."""
    for rel, key, cat, limit, page_size in LISTINGS:
        path = os.path.join(ROOT, rel)
        with open(path, encoding='utf-8') as f:
            src = f.read()
        items = sorted((p for p in posts if cat in p['categories']), key=lambda p: p['date'], reverse=True)
        items = items[:limit] if limit else items
        m = re.search(r'(<!-- POSTS:%s START[^>]*-->\n)(.*?)(\n\s*<!-- POSTS:%s END -->)' % (key, key), src, re.S)
        if not m:
            print(f'  ! no POSTS:{key} block in {rel}')
            continue
        grid = re.search(r'<div class="cs-grid[^"]*" id="([^"]+)"', m.group(2)).group(1)
        size = f' data-page-size="{page_size}"' if page_size else ''
        cards = '\n'.join(card_html(p, i, rw, indent='    ', hidden=bool(page_size) and i >= page_size)
                          for i, p in enumerate(items))
        block = f'  <div class="cs-grid" id="{grid}"{size}>\n{cards}\n  </div>'
        src = src[:m.start(2)] + block + src[m.end(2):]
        with open(path, 'w', encoding='utf-8') as f:
            f.write(src)
        print(f'  listing {rel}: {len(items)} card(s)')


def render(post, posts, rw, nav, foot):
    head = post['head']
    url = SITE + post['new_path']
    fix = TITLE_FIXES.get(post['slug'], {})
    title = fix.get('seo_title') or head['title'] or f"{post['title']} • PeoplesHR"
    title = title.replace('&bull;', '•')
    desc = fix.get('description') or head['description'] or post['excerpt']
    robots = head['robots'] or 'index, follow'
    robots = ', '.join(sorted(set(x.strip() for x in robots.split(',')), key=lambda x: (x not in ('index', 'follow'), x)))
    img = post['featured']
    img_url = SITE + rw.image(img['path']) if img else f'{SITE}/uploads/2024/03/PeoplesHR-Logo-1200x630-1.webp'
    img_alt = (img and img['alt']) or head['og_image_alt'] or post['title']
    section_path = '/blog/' if post['section'] == 'blog' else '/news/'
    schema_type = 'BlogPosting' if post['section'] == 'blog' else 'NewsArticle'
    content = clean_content(post['content'], rw, post['slug'])
    minutes = read_minutes(content)

    schema = {
        '@context': 'https://schema.org',
        '@type': schema_type,
        '@id': url + '#article',
        'mainEntityOfPage': url,
        'headline': post['title'],
        'description': desc,
        'image': [img_url],
        'datePublished': iso_utc(post['date_gmt']),
        'dateModified': iso_utc(post['modified_gmt']),
        'author': {'@type': 'Organization', 'name': 'PeoplesHR', 'url': SITE + '/'},
        'publisher': {'@id': SITE + '/#organization'},
        'articleSection': post['section_name'],
        'inLanguage': 'en-US',
    }
    schema_json = json.dumps(schema, ensure_ascii=False, indent=2).replace('</', '<\\/')

    hero_img = ''
    if img:
        dims = f' width="{img["width"]}" height="{img["height"]}"' if img.get('width') else ''
        hero_img = (f'    <figure class="bp-hero-img">\n'
                    f'      <img src="{esc(rw.image(img["path"]))}" alt="{esc(img_alt)}"{dims} fetchpriority="high" decoding="async">\n'
                    f'    </figure>\n')

    related = related_cards(post, posts, rw)
    php_crumb = post['title'].replace('\\', '\\\\').replace("'", "\\'")

    return f"""<?php require_once __DIR__ . '/../inc/geo.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}" />
  <meta name="robots" content="{esc(robots)}" />
  <link rel="canonical" href="{url}" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="PeoplesHR" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:title" content="{esc(title)}" />
  <meta property="og:description" content="{esc(desc)}" />
  <meta property="og:url" content="{url}" />
  <meta property="og:image" content="{esc(img_url)}" />
  <meta property="og:image:alt" content="{esc(img_alt)}" />
  <meta property="article:section" content="{esc(post['section_name'])}" />
  <meta property="article:published_time" content="{iso_utc(post['date_gmt'])}" />
  <meta property="article:modified_time" content="{iso_utc(post['modified_gmt'])}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{esc(title)}" />
  <meta name="twitter:description" content="{esc(desc)}" />
  <meta name="twitter:image" content="{esc(img_url)}" />

  <?php $phrCrumbName = '{php_crumb}'; include __DIR__ . '/../inc/seo-schema.php'; ?>
  <script type="application/ld+json">
{schema_json}
  </script>

  <!-- CSS -->
  <link rel="stylesheet" href="<?php echo asset_v('/css/styles.css'); ?>" />
   <link rel="stylesheet" href="<?php echo asset_v('/css/navbar.css'); ?>" />
   <link rel="stylesheet" href="<?php echo asset_v('/css/footer.css'); ?>" />
   <link rel="stylesheet" href="<?php echo asset_v('/css/blog-post.css'); ?>" />
   <link rel="stylesheet" href="<?php echo asset_v('/css/post-cards.css'); ?>" />
  <!-- Start of HubSpot Embed Code -->
  <script type="text/javascript" id="hs-script-loader" async defer src="//js-na2.hs-scripts.com/45700506.js"></script>
  <!-- End of HubSpot Embed Code -->
  <?php include __DIR__ . '/../inc/ga4.php'; ?>
  <?php include __DIR__ . '/../inc/geo-head.php'; ?>
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/favicon.png" />
  <link rel="describedby" href="/llms.txt" type="text/markdown">
</head>

<body>

{nav}
<!-- Generated by tools/blog-migration/build.py from {esc(post['link'])} -->

<article class="bp-article">

  <div class="bp-hero">
    <div class="bp-crumbs" role="navigation" aria-label="Breadcrumb">
      <a href="/">Home</a><span aria-hidden="true">/</span><a href="{section_path}">{esc(post['section_name'])}</a>
    </div>
    <h1 class="bp-title">{esc(post['title'])}</h1>
    <p class="bp-meta">
      <time datetime="{iso_utc(post['date_gmt'])}">{fmt_date(post['date'])}</time>
      <span aria-hidden="true">&middot;</span>
      <span>{minutes} min read</span>
    </p>
{hero_img}  </div>

  <div class="bp-body">
{content}
  </div>

</article>

<section class="bp-cta">
  <div class="bp-cta-inner">
    <h2>See PeoplesHR in action</h2>
    <p>Find out how PeoplesHR brings HR, payroll, time and talent together in one platform.</p>
    <a class="btn-primary" href="/get-in-touch/">Request a Demo</a>
  </div>
</section>
{f'''
<section class="case-studies-section bp-related">
  <h2 class="bp-related-title">More from the {esc(post['section_name'])}</h2>
  <div class="cs-grid">
{related}
  </div>
</section>
''' if related else ''}
{foot}

<!-- JS -->
<script src="<?php echo asset_v('/js/phr.js'); ?>"></script>
<script src="<?php echo asset_v('/js/navbar.js'); ?>"></script>

</body>
</html>
"""


# --------------------------------------------------------------------- main

def text_of(html_str):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', html_str or ''))).strip()


def excerpt(html_str, n=140):
    t = re.sub(r'\[(?:&hellip;|…)\]$', '', text_of(html_str)).strip()
    t = re.sub(r'\s*\[…\]$', '', t)
    t = re.sub(r'(?<=[a-z]{2}[.!?])(?=[A-Z][a-z])', ' ', t)  # "employees.Some" (see fix_text)
    t = re.sub(r'(?<=[a-z]{3},)(?=[a-z]{3})', ' ', t)
    if len(t) > n:
        t = re.sub(r'\s+\S*$', '', t[:n]) + '…'
    return t


def prepare(raw):
    media = (raw.get('_embedded') or {}).get('wp:featuredmedia') or []
    featured = None
    if media and media[0].get('source_url'):
        m = media[0]
        details = m.get('media_details') or {}
        sizes = details.get('sizes') or {}
        card = (sizes.get('large') or sizes.get('full') or {}).get('source_url') or m['source_url']
        featured = {
            'path': urllib.parse.urlsplit(m['source_url']).path,
            'card': urllib.parse.urlsplit(card).path,
            'alt': m.get('alt_text') or '',
            'width': details.get('width'),
            'height': details.get('height'),
        }
    raw['categories'] = CATEGORY_FIXES.get(raw['slug'], raw['categories'])
    is_blog = BLOG_CAT in raw['categories']
    terms = (raw.get('_embedded') or {}).get('wp:term') or [[]]
    tag = terms[0][0]['name'] if terms and terms[0] else ('Blog' if is_blog else 'News')
    if raw['slug'] in CATEGORY_FIXES:
        tag = 'Blog' if is_blog else 'News'
    return {
        'id': raw['id'],
        'slug': raw['slug'],
        'link': raw['link'],
        'title': TITLE_FIXES.get(raw['slug'], {}).get('title') or text_of(raw['title']['rendered']),
        'excerpt': excerpt(raw['excerpt']['rendered']),
        'content': raw['content']['rendered'],
        'date': raw['date'], 'date_gmt': raw['date_gmt'],
        'modified_gmt': raw['modified_gmt'],
        'section': 'blog' if is_blog else 'news',
        'section_name': 'Blog' if is_blog else 'News',
        'new_path': ('/blog/' if is_blog else '/news/') + raw['slug'] + '/',
        'featured': featured,
        'categories': raw['categories'],
        'tag': tag,
    }


def write_sitemap(posts):
    """Post URLs (with last-modified dates) go in sitemap.xml's POSTS block."""
    path = os.path.join(ROOT, 'sitemap.xml')
    with open(path, encoding='utf-8') as f:
        src = f.read()
    urls = ''.join(f"  <url><loc>{SITE}{p['new_path']}</loc><lastmod>{p['modified_gmt'][:10]}</lastmod></url>\n"
                   for p in sorted(posts, key=lambda p: p['new_path']))
    new, n = re.subn(r'(<!-- POSTS START[^>]*-->\n).*?(  <!-- POSTS END -->)', lambda m: m.group(1) + urls + m.group(2), src, flags=re.S)
    if not n:
        print('  ! no POSTS block in sitemap.xml')
        return
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new)
    print(f'  sitemap.xml: {len(posts)} post URL(s)')


def load_pages(refresh):
    def fetch():
        pages, page = [], 1
        while True:
            batch = json.loads(http_get(f'{WP}/wp-json/wp/v2/pages?per_page=100&page={page}&_fields=id,slug,link'))
            pages += batch
            if len(batch) < 100:
                return json.dumps(pages)
            page += 1
    return json.loads(cached('pages.json', fetch, refresh))


def page_redirects(pages, rw):
    """Old WordPress copies of site pages -> the same page on peopleshr.com."""
    rows = []
    for pg in pages:
        path = urllib.parse.urlsplit(pg['link']).path
        slug = path.strip('/')
        target = rw.page_path(path)
        local = target.strip('/') or 'index'
        exists = (any(os.path.exists(os.path.join(ROOT, c)) for c in (local + '.html', local + '/index.html'))
                  or local in HTACCESS_PAGES)
        note = 'old WordPress copy of a site page'
        if slug in REMOVED_PAGES:
            rows.append([WP + path, SITE + REMOVED_PAGES[slug], 301, 'page removed (not migrated)'])
            continue
        if not exists:
            if slug not in PAGE_FALLBACKS:
                print(f'  ! no target for old page {path}; add it to PAGE_FALLBACKS')
                continue
            target, note = PAGE_FALLBACKS[slug], 'page removed (not migrated)'
        rows.append([WP + path, SITE + target, 301, note])
    return rows


def legacy_post_redirects(posts):
    """Older main-domain URLs for posts that .htaccess already redirects
    (date permalinks like /2022/05/17/<slug>/, renamed slugs), so the map
    lists every URL that leads to each post."""
    new = {p['slug']: p['new_path'] for p in posts}
    rows = []
    with open(os.path.join(ROOT, '.htaccess'), encoding='utf-8', errors='replace') as f:
        for line in f:
            m = re.match(r'RewriteRule \^(\S+?)(?:/\?)?\$ (\S+) \[R=30[12]', line.strip())
            if not m:
                continue
            src, tgt = m.group(1).strip('/'), m.group(2).strip('/')
            slug = tgt.split('/')[-1]
            # "^(2020/10/28/)?slug" matches two URLs: with and without the prefix.
            opt = re.match(r'^\(([^()]+)\)\?(.+)$', src)
            for path in ([opt.group(2), opt.group(1) + opt.group(2)] if opt else [src]):
                path = path.strip('/')
                if slug in new and path not in new and not re.search(r'[()?*+\[\]|\\]', path):
                    rows.append([f'{SITE}/{path}/', SITE + new[slug], 301, 'older main-domain URL of the post (in .htaccess)'])
    return rows


def write_redirect_map(posts, page_rows, removed=()):
    path = os.path.join(HERE, 'redirect-map.csv')
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['old_url', 'new_url', 'status', 'note'])
        for p in sorted(posts, key=lambda p: p['slug']):
            new = SITE + p['new_path']
            w.writerow([f"{WP}/{p['slug']}/", new, 301, 'subdomain post URL'])
            w.writerow([f"{SITE}/{p['slug']}/", new, 301, 'original main-domain post URL (404s today)'])
        by_slug = {p['slug']: p for p in posts}
        for p in sorted(removed, key=lambda p: p['slug']):
            new = SITE + by_slug[REMOVED_POSTS[p['slug']]]['new_path']
            w.writerow([f"{WP}/{p['slug']}/", new, 301, 'removed duplicate post'])
            w.writerow([f"{SITE}/{p['slug']}/", new, 301, 'removed duplicate post, original main-domain URL'])
        listed = {f"{SITE}/{p['slug']}/" for p in removed}
        for row in sorted(legacy_post_redirects(posts)):
            if row[0] not in listed:
                w.writerow(row)
        for row in sorted(page_rows):
            w.writerow(row)
        for old, new, note in [
            (f'{WP}/feed/', f'{SITE}/blog/', 'RSS feed'),
            # "12 Best Software HRIS Indonesia For 2025": deleted from WordPress
            (f'{SITE}/12-best-hris-software-in-indonesia-for-growing-businesses/', f'{SITE}/blog/', 'deleted article'),
            (f'{SITE}/best-software-hris-indonesia/', f'{SITE}/blog/', 'deleted article'),
            (f'{WP}/12-best-hris-software-in-indonesia-for-growing-businesses/', f'{SITE}/blog/', 'deleted article'),
            (f'{WP}/best-software-hris-indonesia/', f'{SITE}/blog/', 'deleted article'),
            (f'{WP}/category/blogs/', f'{SITE}/blog/', 'category archive'),
            (f'{WP}/category/news/', f'{SITE}/news/', 'category archive'),
            (f'{WP}/category/events/', f'{SITE}/events/', 'category archive'),
            (f'{WP}/wp-content/uploads/2026/02/joliibee.html', f'{SITE}/jollibee/', 'Jollibee pitch page (was framed into /jollibee/); now jollibee.html'),
            (f'{SITE}/wp-content/uploads/2026/02/joliibee.html', f'{SITE}/jollibee/', 'same, old main-domain URL'),
            (f'{WP}/wp-content/uploads/2026/02/peopleshr-vs-Mekari.html', f'{SITE}/peopleshr-vs-mekari/', 'Mekari comparison page (was framed into /peopleshr-vs-mekari/); now peopleshr-vs-mekari.html'),
            (f'{SITE}/wp-content/uploads/2026/02/peopleshr-vs-Mekari.html', f'{SITE}/peopleshr-vs-mekari/', 'same, old main-domain URL'),
            (f'{WP}/wp-content/uploads/2026/03/webinar-landing-march-v6.html', f'{SITE}/webinars/', 'Everywhere Workforce webinar page (was framed in); retired, recording is on /webinars/'),
            (f'{SITE}/wp-content/uploads/2026/03/webinar-landing-march-v6.html', f'{SITE}/webinars/', 'same, old main-domain URL'),
            (f'{SITE}/webinar-the-everywhere-workforce/', f'{SITE}/webinars/', 'retired webinar page, main-domain URL'),
            (f'{WP}/wp-content/uploads/*', f'{SITE}/uploads/*', 'PATTERN: all images/files, same path after uploads/'),
            (f'{SITE}/wp-content/uploads/*', f'{SITE}/uploads/*', 'PATTERN: same, for old main-domain image URLs'),
            (f'{WP}/*', f'{SITE}/*', 'PATTERN: catch-all for anything not listed above'),
        ]:
            w.writerow([old, new, 301, note])
    return path


def main(argv):
    refresh = '--refresh' in argv
    only = [a for a in argv if not a.startswith('--')]

    print('Loading posts…')
    all_posts = [prepare(p) for p in load_posts(refresh)]
    posts = [p for p in all_posts if p['slug'] not in REMOVED_POSTS]
    removed = [p for p in all_posts if p['slug'] in REMOVED_POSTS]
    by_slug = {p['slug']: p for p in posts}
    unknown = [s for s in only if s not in by_slug]
    if unknown:
        sys.exit('Unknown slug(s): ' + ', '.join(unknown))
    targets = [by_slug[s] for s in only] if only else posts

    rw = Rewriter(posts)
    by_new = {p['slug']: p for p in posts}
    for p in removed:  # links to a removed post go to its replacement
        rw.post_url[p['slug']] = by_new[REMOVED_POSTS[p['slug']]]['new_path']
    nav, foot = site_chrome()
    for p in targets:
        p['head'] = load_head(p, refresh)
        out_dir = os.path.join(ROOT, p['section'])
        os.makedirs(out_dir, exist_ok=True)
        page = render(p, posts, rw, nav, foot)
        with open(os.path.join(out_dir, p['slug'] + '.html'), 'w', encoding='utf-8') as f:
            f.write(page)
        print(f"  wrote {p['section']}/{p['slug']}.html")

    if not only:
        write_listings(posts, rw)
        write_sitemap(posts)

    print('Downloading images…')
    missing = rw.download_images()
    page_rows = page_redirects(load_pages(refresh), rw)
    print('Redirect map:', os.path.relpath(write_redirect_map(posts, page_rows, removed), ROOT))
    print(f'Done: {len(targets)} page(s), {len(rw.images)} image(s), {missing} missing.')


if __name__ == '__main__':
    main(sys.argv[1:])
