// "Load More" for the post listings (blog, news, events). The cards are
// already in the page -- written by tools/blog-migration/build.py so search
// engines see a link to every post -- and the ones past the first page are
// hidden. Each click shows the next data-page-size of them.

(function () {
  document.querySelectorAll('[data-load-more]').forEach(function (row) {
    var grid = document.getElementById(row.getAttribute('data-load-more'));
    if (!grid) return;
    var size = parseInt(grid.getAttribute('data-page-size') || '6', 10);

    function hiddenCards() {
      return Array.prototype.filter.call(grid.children, function (card) {
        return card.style.display === 'none';
      });
    }

    if (!hiddenCards().length) return;
    row.style.display = '';
    row.querySelector('a').addEventListener('click', function (e) {
      e.preventDefault();
      hiddenCards().slice(0, size).forEach(function (card) { card.style.display = ''; });
      if (!hiddenCards().length) row.style.display = 'none';
    });
  });
})();
