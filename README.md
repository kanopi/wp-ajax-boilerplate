
## wp-ajax-boilerplate

Utilities for outputting and interacting with wp-query asynchronously

### Description

Use `[ajax]` shortcodes to output loops of posts asynchronously.

Ajax-output can be filtered in a number of ways.
1. Firstly, url-params can be used to modify the default (initial, on page-load) queries of all ajax-output on the page. `?ajax_post_type=post&post_tag=foo` would output posts with the tag "foo". `?category=bar` would output posts in the "bar" category.
2. Secondly, shortcode attributes (translated into data-attributes (for those who speak geek)) can be used to filter the default queries on a per-loop basis. `[ajax post_type="post"]` will output posts, even if `?ajax_post_type=page` is set in the url.
3. Finally, additional filters can be added after pageload ( add/remove filter buttons exist currently without style & dropdown menus are wip )

### shortcodes

There are 2x shortcodes to work with: `[ajax][/ajax]` & `[ajax_filter]`. Please don't use these for a production build yet & expect a smooth update, these shortcodes may be refactored & their parameter names changed... But if you're feeling daring, here's how to use them:  

The `[ajax][/ajax]` shortcode outputs a loop which is populated by an ajax request & features a loadmore button (currently limited to two results per request to make testing easier). If you want to, you can pre-filter the output. The default output is all posts, but let's say you want pages, use the following: `[ajax post_type="page"][/ajax]` if you want to display only posts from a particular category use the following: `[ajax taxo="category" term="dog"][/ajax]` the taxonomy filters are currently exclusive by default (they use AND, not OR), so `[ajax taxo="post_tag" term="hat,coat"][/ajax]` would output posts which are tagged both hat & coat, but not either or. Note that the parameters are the slug of the given taxonomy-term.

We can also filter all ajax-shortcode loops on a page via url-params. Visiting a page with an ajax shortcode & adding get-parameters will filter ALL ajax shortcodes on that page. For instance, if we have two ajax shortcodes on a page: `[ajax][/ajax]` & `[ajax taxo="category" term="dogs"][/ajax]` & we add `?category=cats` to the url, the first shortcode would output posts in the Cats category & the second shortcode would output only posts which are tagged both Cats & Dogs.

Now the fun part! We can filter the data even more using the localized filters shortcode. For example, if we wanted to switch between post-types within on of our async-loops, we could use:
`[ajax][ajax_filter query_var="post_type" query_val="post,page"][/ajax]`

If we wanted to output pages by default & still have local filters, we could use:
`[ajax post_type="page"][ajax_filter query_var="post_type" query_val="post,page"][/ajax]`

& if we wanted to get really trick, we could throw a url parameter at it too, but tacking: `?ajax_post_type=page` onto the end of our url & then using: `[ajax][ajax_filter query_var="post_type" query_val="post,page"][/ajax]` ( I've used `ajax_post_type` as the get param to avoid collusion with Wordpress' built-in `post_type` query param, we could hack around this, but it wouldn't necessarily make things better. )

Now, if we want to automatically modify the query params, we need only use the [ajax_filter] shortcode from outside of the ajax loop shortcodes, eg:
like this: `[ajax_filter query_var="post_type" query_val="post,page"]` & not like this `[ajax][ajax_filter query_var="post_type" query_val="post,page"][/ajax]`

If you're not already scared, then please do take it for a spin!

The `./public/js/wp-ajax-public.js` & `./public/class-wp-ajax-public.php` files are where the action happens.

The architecture of this plugin comes from [WordPress Plugin Boilerplate Generator](https://wppb.me/).

This plugin is an attempt at organizing and aggregating different techniques for running common WordPress queries asynchronously. The goal is to make a versatile developer-first boilerplate which can be scaled easily to present data from & interact with WordPress asynchronously.

== ToDos ==

- More filter options
- Valid post-types & taxonomy whitelists
- Hide load-more buttons if found-posts < limit/per_page || limit*index >= found-posts
- Refactor for DRYer code

### End Goal

- Finish: post_type, multiple taxo & terms, orderby, & meta queries ajax-filters front & backend, then convert to blocks & add support for rest-api.
