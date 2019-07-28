
## wp-ajax-boilerplate

Utilities for outputting and interacting with wp-query asynchronously

### Description

Use `[ajax]` shortcodes to output loops of posts asynchronously.

Ajax-output can be filtered in a number of ways.
1. Firstly, url-params can be used to modify the default (initial, on page-load) queries of all ajax-output on the page. `?ajax_post_type=post&post_tag=foo` would output posts with the tag "foo". `?category=bar` would output posts in the "bar" category.
2. Secondly, shortcode attributes (translated into data-attributes (for those who speak geek)) can be used to filter the default queries on a per-loop basis. `[ajax post_type="post"]` will output posts, even if `?ajax_post_type=page` is set in the url.
3. Finally, additional filters can be added after pageload (dropdown menus / add/remove filter buttons currently wip)

The `./public/js/wp-ajax-public.js` & `./public/class-wp-ajax-public.php` files are where the action happens.

The architecture of this plugin comes from [WordPress Plugin Boilerplate Generator](https://wppb.me/).

This plugin is an attempt at organizing and aggregating different techniques for running common WordPress queries asynchronously. The goal is to make a versatile developer-first boilerplate which can be scaled easily to present data from & interact with WordPress asynchronously.

== ToDos ==

- Add filters shortcode: select, radio, checkbox, to work in tandem with url-params for all filters
- Build out filter-menus shortcodes & click-handlers
- Hide load-more buttons if found-posts < limit/per_page || limit*index >= found-posts
- Handle add/remove taxonomy terms - re-apply default terms if needed - consider multiple loops per page
- Consider allowed-terms list (& admin-options page) to allow tax-query fallback in final else of apply-terms function

### End Goal

- Finish: post_type, multiple taxo & terms, orderby, & meta queries ajax-filters front & backend, then convert to blocks & add support for rest-api.
