// Company page — News teaser: fetches the latest posts from the "News"
// category (id 19) live from the WordPress REST API and renders them using
// the same .cs-grid / .cs-card styling as the news, blog, and events pages.
// Shows a small fixed batch only (no pagination) — see news.html for the
// full paginated listing.

(function () {
  var API_BASE = 'https://blog.peopleshr.com/wp-json/wp/v2/posts';
  var NEWS_CATEGORY_ID = 19; // "News" category (slug: news)
  var PER_PAGE = 3;

  var grid = document.getElementById('companyNewsGrid');
  var loading = document.getElementById('companyNewsLoading');
  var errorBox = document.getElementById('companyNewsError');

  if (!grid) return;

  var cardIndex = 0;

  function stripHtml(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return (tmp.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function excerptText(html, max) {
    var text = stripHtml(html).replace(/\[&hellip;\]|\[…\]$/i, '').trim();
    if (text.length > max) {
      text = text.slice(0, max).replace(/\s+\S*$/, '') + '…';
    }
    return text;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function cardHTML(post) {
    var media = post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0];
    var imgUrl = media && media.source_url;
    var dateLabel = formatDate(post.date);
    var gradClass = 'cs-img-' + ((cardIndex % 3) + 1);
    cardIndex++;
    var imgStyle = imgUrl
      ? "background-image:url('" + imgUrl + "');background-size:cover;background-position:center;"
      : '';

    return (
      '<div class="cs-card">' +
        '<div class="cs-img ' + gradClass + '" style="' + imgStyle + '">' +
          '<span class="cs-tag">NEWS</span>' +
        '</div>' +
        '<div class="cs-content">' +
          (dateLabel ? '<p class="cs-card-industry"><span>' + dateLabel + '</span></p>' : '') +
          '<h3>' + post.title.rendered + '</h3>' +
          '<p>' + excerptText(post.excerpt.rendered, 140) + '</p>' +
          '<a href="' + post.link + '" class="read-more" target="_blank" rel="noopener">Read More &rarr;</a>' +
        '</div>' +
      '</div>'
    );
  }

  function showError() {
    if (loading) loading.style.display = 'none';
    if (errorBox) {
      errorBox.style.display = 'block';
      errorBox.textContent = 'Could not load news right now. Please try again later.';
    }
  }

  fetch(API_BASE + '?_embed&categories=' + NEWS_CATEGORY_ID + '&per_page=' + PER_PAGE + '&page=1')
    .then(function (res) {
      if (!res.ok) throw new Error('status ' + res.status);
      return res.json();
    })
    .then(function (posts) {
      if (loading) loading.style.display = 'none';
      if (!posts.length) {
        grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;">No news found.</p>';
        return;
      }
      grid.innerHTML = posts.map(cardHTML).join('');
    })
    .catch(showError);
})();
