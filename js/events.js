// PeoplesHR Events page — fetches posts from the "Events" category (id 1)
// live from the WordPress REST API and renders them using the same
// .cs-grid / .cs-card styling as the blog and case-studies pages.
// New event posts published on WordPress under the Events category
// appear here automatically — nothing on this page needs manual updates.

(function () {
  var API_BASE = 'https://blog.peopleshr.com/wp-json/wp/v2/posts';
  var EVENTS_CATEGORY_ID = 1; // "Events" category (slug: events)
  var PER_PAGE = 6;

  var grid = document.getElementById('eventsGrid');
  var loading = document.getElementById('eventsLoading');
  var errorBox = document.getElementById('eventsError');
  var loadMoreRow = document.getElementById('eventsLoadMoreRow');
  var loadMoreBtn = document.getElementById('eventsLoadMoreBtn');

  if (!grid) return;

  var page = 1;
  var totalPages = 1;
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
    // Always label "Events" here — this page is filtered to the Events
    // category, but posts are often cross-tagged (e.g. also under News),
    // so the first embedded term isn't reliably "Events".
    var category = 'Events';
    var dateLabel = formatDate(post.date);
    var gradClass = 'cs-img-' + ((cardIndex % 3) + 1);
    cardIndex++;
    var imgStyle = imgUrl
      ? "background-image:url('" + imgUrl + "');background-size:cover;background-position:center;"
      : '';

    return (
      '<div class="cs-card">' +
        '<div class="cs-img ' + gradClass + '" style="' + imgStyle + '">' +
          '<span class="cs-tag">' + category.toUpperCase() + '</span>' +
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

  function fetchPage(p) {
    return fetch(API_BASE + '?_embed&categories=' + EVENTS_CATEGORY_ID + '&per_page=' + PER_PAGE + '&page=' + p).then(function (res) {
      if (!res.ok) throw new Error('status ' + res.status);
      totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
      return res.json();
    });
  }

  function showError() {
    if (loading) loading.style.display = 'none';
    if (loadMoreRow) loadMoreRow.style.display = 'none';
    if (errorBox) {
      errorBox.style.display = 'block';
      errorBox.textContent = 'Could not load events right now. Please try again later.';
    }
  }

  function loadNext() {
    loadMoreBtn.textContent = 'Loading…';
    fetchPage(page)
      .then(function (posts) {
        grid.insertAdjacentHTML('beforeend', posts.map(cardHTML).join(''));
        page++;
        loadMoreBtn.textContent = 'Load More Events';
        if (page > totalPages) loadMoreRow.style.display = 'none';
      })
      .catch(showError);
  }

  fetchPage(page)
    .then(function (posts) {
      if (loading) loading.style.display = 'none';
      if (!posts.length) {
        grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;">No events found.</p>';
        return;
      }
      grid.innerHTML = posts.map(cardHTML).join('');
      page++;
      if (page <= totalPages) {
        loadMoreRow.style.display = '';
        loadMoreBtn.addEventListener('click', function (e) {
          e.preventDefault();
          loadNext();
        });
      }
    })
    .catch(showError);
})();
