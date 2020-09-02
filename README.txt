=== Plugin Name ===
Contributors: ajmcfadyen
Donate link: https://kanopistudios.com
Tags: ajax, headless, async, wp-query, filter
Requires at least: 3.0.1
Tested up to: 3.4
Stable tag: 4.3
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

# WP Query javaScript & XML ( _wpqjx_ / `wp-ajax-boilerplate` )

## A collection of tools for interfacing with wp-query asynchronously.

## Setup

1. Place a copy of this repo at ./wp-content/plugins/wpqjx in your WordPress installation.
1. Activate plugin
1. Add ajax-output markup to site via html or shortcode
1. Ajax output can be filtered via get-params, element-attributes, & at runtime

### Basic usage / quickstart
> Add the html below to a post or page ( or use the `[wpqjx][/wpqjx]` shortcode )
```
<div class="wpqjx-wrap">
    <div class="wpqjx-feed">
    </div>
    <button class="wpqjx-load">load more</button>
</div>
```

### Output can be filtered
1. Firstly, url-params can be used to modify the default (initial, on page-load) queries of all ajax-output on the page.
   - `?wpqjx_post_type=post&wpqjx_post_tag=foo` would output posts with the tag "foo".
   - `?category=bar` would output posts in the "bar" category.
1. Secondly, shortcode attributes ( or data-attributes on the ajax-loop container html ) can be used to filter the default queries on a per-loop basis.
   - `[wpqjx query_var="post_type" query_val="post"][/wpqjx]` will output posts, even if `?wpqjx_post_type=page` is set in the url.
1. Finally, additional filters can be added after pageload via the filters markup/shortcodes
1. Sumup: get params set global browser filter, element-attributes refine filters on a per-loop basis, & ux-interface can be used to filter within loops & at a global-level, depending if they're wrapped in a loop-container


## [WP_Query Parameters](https://developer.wordpress.org/reference/classes/wp_query/#taxonomy-parameters) Currently Supported
> The following WP_Query params can be applied to ajax-loop output in 3 ways
   1. As a get-param with a `ajax_` prefix, ex: `?ajax_post_type=cpt_one,cpt_two`
   1. As a data-attribute on the parent `.wpqjx-wrap[data-query_var][data-query_val]`
   1. Lastly at runtime via the filters interface , `.wpqjx-filter .wpqjx-filter[data-query_var][data-query_val]` * note that these filter locally when inside of a `.wpqjx-wrap` parent element and apply & remove get-params when placed outside

- post_type (Array, post_type strings)
- post_status (Array, post_status strings)
- author__in (Array, author ids)
- author__not_in (Array, author ids)
- category__and (Array, category ids)
- category__in (Array, category ids)
- category__not_in (Array, category ids)
- tag__and (Array, tag ids)
- tag__in (Array, tag ids)
- tag__not_in (Array, tag ids)
- tag_slug__and (Array, slugs)
- tag_slug__in (Array, slugs)
- post_parent__in (Array, post ids)
- post_parent__not_in (Array, post ids)
- post__in (Array, post ids)
- post__not_in (Array, post ids)

- cat (Integer)
- tag_id (Integer)
- p (Integer)
- page_id (Integer)
- post_parent (Integer)
- posts_per_page (Integer)

- post_tag ( Array, tax_query )
- category ( Array, tax_query )


## HTML Reference / Testing Interface

```
<p>.wpqjx-filter outside of .wpqjx-wrap will modify global get-params & cause page refresh</p>
<button class="wpqjx-filter wpqjx-filter--inactive" data-query_var="post_type" data-query_val="post">post</button>
<button class="wpqjx-filter wpqjx-filter--inactive" data-query_var="post_type" data-query_val="page">page</button>

<p>.wpqjx-filter inside .wpqjx-wrap will modify query within parent .wpqjx-wrap</p>
<div class="wpqjx-wrap">
	<button class="wpqjx-filter wpqjx-filter--inactive" data-query_var="post_type" data-query_val="post">post</button>
	<button class="wpqjx-filter wpqjx-filter--inactive" data-query_var="post_type" data-query_val="page">page</button>
	<div class="wpqjx-feed">
	</div>
	<button class="wpqjx-load">load more</button>
</div>

<p>post_type attribute adds default local filters</p>
<div class="wpqjx-wrap" data-query_var="post_type" data-query_val="page">
	<button class="wpqjx-filter wpqjx-filter--inactive" data-query_var="post_type" data-query_val="post">post</button>
	<button class="wpqjx-filter wpqjx-filter--inactive" data-query_var="post_type" data-query_val="page">page</button>
	<div class="wpqjx-feed">
	</div>
	<button class="wpqjx-load">load more</button>
</div>

<p>use category or tag & term attributes</p>
<div class="wpqjx-wrap" data-query_var="post_tag" data-query_val="lorem">
	<button class="wpqjx-filter wpqjx-filter--inactive" data-query_var="post_tag" data-query_val="lorem">lorem</button>
	<button class="wpqjx-filter wpqjx-filter--inactive" data-query_var="post_tag" data-query_val="ipsum">ipsum</button>
	<div class="wpqjx-feed">
	</div>
	<button class="wpqjx-load">load more</button>
</div>

<p>multiple .wpqjx-filter inside .wpqjx-wrap compliment each other</p>
<div class="wpqjx-wrap" data-query_var="post_tag" data-query_val="lorem">

	<button class="wpqjx-filter wpqjx-filter--inactive" data-query_var="category" data-query_val="animals">animals</button>
	<button class="wpqjx-filter wpqjx-filter--inactive" data-query_var="category" data-query_val="cats">cats</button>
	<button class="wpqjx-filter wpqjx-filter--inactive" data-query_var="category" data-query_val="dogs">dogs</button>

	<button class="wpqjx-filter wpqjx-filter--inactive" data-query_var="post_tag" data-query_val="lorem">lorem</button>
	<button class="wpqjx-filter wpqjx-filter--inactive" data-query_var="post_tag" data-query_val="ipsum">ipsum</button>
	<button class="wpqjx-filter wpqjx-filter--inactive" data-query_var="post_tag" data-query_val="set">set</button>

	<div class="wpqjx-feed">
	</div>
	<button class="wpqjx-load">load more</button>

</div>
```

## Shortcodes

There are 2x shortcodes to work with: `[wpqjx][/wpqjx]` & `[wpqjx_filter]`.

### AJAX Loop Output
Use `[wpqjx][/wpqjx]` shortcode (or `.wpqjx-wrap` class) to output ajax loop with async, load-more functionality. Use `query_var` & `query_val` parameters to pre-filter loop query-params after get-params are applied but before asynchronously loaded content is rendered.

The `[wpqjx][/wpqjx]` shortcode outputs a loop which is populated by an ajax request & features a loadmore button (currently limited to two results per request to make testing easier). If you want to, you can pre-filter the output.

 The default output is all posts, but let's say you want pages, use the following: `[wpqjx query_var="post_type" query_val="page"][/wpqjx]` if you want to display only posts from a particular category use the following: `[wpqjx query_var="category" query_val="dog"][/wpqjx]` the taxonomy filters are currently exclusive by default (they use AND, not OR), so `[wpqjx query_var="post_tag" query_val="hat,coat"][/wpqjx]` would output posts which are tagged both hat & coat, but not either or. Note that the parameters are the slug of the given taxonomy-term.

We can also filter all ajax-shortcode loops on a page via url-params. Visiting a page with an ajax shortcode & adding get-parameters will filter ALL ajax shortcodes on that page. For instance, if we have two ajax shortcodes on a page: `[wpqjx][/wpqjx]` & `[wpqjx query_var="category" query_val="dogs"][/wpqjx]` & we add `?wpqjx_category=cats` to the url, the first shortcode would output posts in the Cats category & the second shortcode would output only posts which are tagged both Cats & Dogs.


### AJAX Filter Output
Use `[wpqjx_filter]` shortcode or relavent markup to output filters. Filters outside of `[wpqjx][/wpqjx]` shortcode will add/remove get-params & globally filter all shortcodes/loops on page. Filters used inside of `[wpqjx][/wpqjx]` shortcode will modify filter-rules applied to the shortcode which they are nested in.

We can filter the data even more using the localized filters shortcode. For example, if we wanted to switch between post-types within on of our async-loops, we could use:
`[wpqjx][wpqjx_filter query_var="post_type" query_val="post,page"][/wpqjx]`

If we wanted to output pages by default & still have local filters, we could use:
`[wpqjx post_type="page"][wpqjx_filter query_var="post_type" query_val="post,page"][/wpqjx]`

& if we wanted to get really tricky, we could throw a url parameter at it too, but tacking: `?wpqjx_post_type=page` onto the end of our url & then using: `[wpqjx][wpqjx_filter query_var="post_type" query_val="post,page"][/wpqjx]` ( We've used `wpqjx_post_type` as the get param to avoid conflict with Wordpress' built-in `post_type` query param, we could work around this, but it wouldn't necessarily make things better. )


### Shortcodes Reference / Testing Interface
```
[wpqjx_filter query_var="post_type" query_val="post,page"]

[wpqjx]
  [wpqjx_filter query_var="post_type" query_val="post,page"]
[/wpqjx]

[wpqjx query_var="post_type" query_val="page"]
  [wpqjx_filter query_var="post_type" query_val="post,page"]
[/wpqjx]

[wpqjx query_var="post_tag" query_val="lorem"]
  [wpqjx_filter query_var="post_tag" query_val="lorem,ipsum"]
[/wpqjx]

[wpqjx query_var="post_tag" query_val="lorem"]
    [wpqjx_filter query_var="category" query_val="animals,cats,dogs"]
    [wpqjx_filter query_var="post_tag" query_val="lorem,ipsum,set"]
[/wpqjx]
```

#### Dev Notes

> Custom functionality located in [/public/js/wpqjx-public.js](https://github.com/kanopi/wpqjx/blob/master/public/js/wpqjx-public.js) & [/public/class-wpqjx-public.php](https://github.com/kanopi/wpqjx/blob/master/public/class-wpqjx-public.php).
> Plugin framework courtesy of [WordPress-Plugin-Boilerplate](https://github.com/devinvinson/WordPress-Plugin-Boilerplate/)
> building/editing wp-query on browser-side and what you want server-side, how cool is that?
