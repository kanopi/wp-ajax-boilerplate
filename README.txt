=== Plugin Name ===
Contributors: (this should be a list of wordpress.org userid's)
Donate link: https://kanopistudios.com
Tags: ajax, headless, async
Requires at least: 3.0.1
Tested up to: 3.4
Stable tag: 4.3
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

# wp-ajax-boilerplate

A collection of tools for interfacing with wp-query asynchronously.

> Custom functionality located in [/public/js/wp-ajax-public.js](https://github.com/kanopi/wp-ajax-boilerplate/blob/master/public/js/wp-ajax-public.js) & [/public/class-wp-ajax-public.php](https://github.com/kanopi/wp-ajax-boilerplate/blob/master/public/class-wp-ajax-public.php). Plugin framework courtesy of [WordPress-Plugin-Boilerplate](https://github.com/devinvinson/WordPress-Plugin-Boilerplate/)

## Setup

1. Place a copy of this repo at ./wp-content/plugins/wp-ajax-boilerplate in your WordPress installation.
1. Activate plugin

## Description

Use `[ajax][/ajax]` shortcodes to output loops of posts asynchronously.

Ajax-output can be filtered in a number of ways.
1. Firstly, url-params can be used to modify the default (initial, on page-load) queries of all ajax-output on the page.
   - `?ajax_post_type=post&post_tag=foo` would output posts with the tag "foo".
   - `?category=bar` would output posts in the "bar" category.
1. Secondly, shortcode attributes ( translated into data-attributes on the ajax-loop container element ) can be used to filter the default queries on a per-loop basis.
   - `[ajax post_type="post"][/ajax]` will output posts, even if `?ajax_post_type=page` is set in the url.
1. Finally, additional filters can be added after pageload via the


## Shortcodes

There are 2x shortcodes to work with: `[ajax][/ajax]` & `[ajax_filter]`. 

### AJAX Loop Output
Use `[ajax][/ajax]` shortcode (or `.wp-ajax-wrap` class) to output ajax loop with async, load-more functionality. Use `post_type` & `taxo/term` parameters to pre-filter loop query-params after get-params are applied but before asynchronously loaded content is rendered.

The `[ajax][/ajax]` shortcode outputs a loop which is populated by an ajax request & features a loadmore button (currently limited to two results per request to make testing easier). If you want to, you can pre-filter the output.

 The default output is all posts, but let's say you want pages, use the following: `[ajax post_type="page"][/ajax]` if you want to display only posts from a particular category use the following: `[ajax taxo="category" term="dog"][/ajax]` the taxonomy filters are currently exclusive by default (they use AND, not OR), so `[ajax taxo="post_tag" term="hat,coat"][/ajax]` would output posts which are tagged both hat & coat, but not either or. Note that the parameters are the slug of the given taxonomy-term.

We can also filter all ajax-shortcode loops on a page via url-params. Visiting a page with an ajax shortcode & adding get-parameters will filter ALL ajax shortcodes on that page. For instance, if we have two ajax shortcodes on a page: `[ajax][/ajax]` & `[ajax taxo="category" term="dogs"][/ajax]` & we add `?category=cats` to the url, the first shortcode would output posts in the Cats category & the second shortcode would output only posts which are tagged both Cats & Dogs.


### AJAX Filter Output
Use `[ajax_filter]` shortcode or relavent markup to output filters. Filters outside of `[ajax][/ajax]` shortcode will add/remove get-params & globally filter all shortcodes/loops on page. Filters used inside of `[ajax][/ajax]` shortcode will modify filter-rules applied to the shortcode which they are nested in.

We can filter the data even more using the localized filters shortcode. For example, if we wanted to switch between post-types within on of our async-loops, we could use:
`[ajax][ajax_filter query_var="post_type" query_val="post,page"][/ajax]`

If we wanted to output pages by default & still have local filters, we could use:
`[ajax post_type="page"][ajax_filter query_var="post_type" query_val="post,page"][/ajax]`

& if we wanted to get really trick, we could throw a url parameter at it too, but tacking: `?ajax_post_type=page` onto the end of our url & then using: `[ajax][ajax_filter query_var="post_type" query_val="post,page"][/ajax]` ( We've used `ajax_post_type` as the get param to avoid conflict with Wordpress' built-in `post_type` query param, we could work around this, but it wouldn't necessarily make things better. )


### Shortcodes Reference / Testing Interface
```
[ajax_filter query_var="post_type" query_val="post,page"]
[ajax post_type="page"][ajax_filter query_var="post_type" query_val="post,page"][/ajax]
[ajax post_type="post"][ajax_filter query_var="post_type" query_val="post,page"][/ajax]
[ajax][ajax_filter query_var="post_type" query_val="post,page"][/ajax]
[ajax_filter taxo="category" query_val="lorem,ipsum,set"]
[ajax_filter taxo="post_tag" query_val="lorem,ipsum,set"]
[ajax taxo="post_tag" query_val="lorem,ipsum,set"][ajax_filter query_var="post_type" query_val="post,page"][/ajax]
[ajax taxo="post_tag" query_val="lorem,ipsum,set"][ajax_filter query_var="post_tag" query_val="lorem,ipsum,set"][/ajax]
[ajax taxo="post_tag" query_val="lorem,ipsum"]
    [ajax_filter query_var="category" query_val="animals,cats,dogs"]
    [ajax_filter query_var="post_tag" query_val="lorem,ipsum,set"]
[/ajax]
```


### HTML Reference / Testing Interface

Equivalent in functionality to "Shortcodes Reference / Testing Interface"

```
<!-- .wp-ajax-filter outside of .wp-ajax-wrap will modify global get-params & cause page refresh -->
<div class="wp-ajax-filter--wrap">
    <div class="wp-ajax-filter">
        <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="ajax_post_type" data-query_val="post">post</button>
        <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="ajax_post_type" data-query_val="page">page</button>
    </div>
</div>

<!-- .wp-ajax-filter inside .wp-ajax-wrap will modify query within parent .wp-ajax-wrap -->
<div class="wp-ajax-wrap" post_type="page">
    <div class="wp-ajax-filter--wrap">
        <div class="wp-ajax-filter">
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="ajax_post_type" data-query_val="post">post</button>
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="ajax_post_type" data-query_val="page">page</button>
        </div>
    </div>
    <button class="wp-ajax-load">load more</button>
</div>

<!-- post_type attribute adds default local filters -->
<div class="wp-ajax-wrap" post_type="post">
    <div class="wp-ajax-filter--wrap">
        <div class="wp-ajax-filter">
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="ajax_post_type" data-query_val="post">post</button>
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="ajax_post_type" data-query_val="page">page</button>
        </div>
    </div>
    <button class="wp-ajax-load">load more</button>
</div>

<div class="wp-ajax-wrap">
    <div class="wp-ajax-filter--wrap">
        <div class="wp-ajax-filter">
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="ajax_post_type" data-query_val="post">post</button>
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="ajax_post_type" data-query_val="page">page</button>
        </div>
    </div>
    <button class="wp-ajax-load">load more</button>
</div>

<!-- taxo & term attributes adds default tax-query -->
<div class="wp-ajax-wrap" taxo="post_tag" term="lorem">
    <div class="wp-ajax-filter--wrap">
        <div class="wp-ajax-filter">
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="ajax_post_type" data-query_val="post">post</button>
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="ajax_post_type" data-query_val="page">page</button>
        </div>
    </div>
    <button class="wp-ajax-load">load more</button>
</div>

<!-- .wp-ajax-filter inside .wp-ajax-wrap, local tax_query control -->
<div class="wp-ajax-wrap" taxo="post_tag">
    <div class="wp-ajax-filter--wrap">
        <div class="wp-ajax-filter">
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="post_tag" data-query_val="lorem">lorem</button>
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="post_tag" data-query_val="ipsum">ipsum</button>
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="post_tag" data-query_val="set">set</button>
        </div>
    </div>
    <button class="wp-ajax-load">load more</button>
</div>

<!-- multiple .wp-ajax-filter inside .wp-ajax-wrap compliment each other -->
<div class="wp-ajax-wrap" taxo="post_tag">
    <div class="wp-ajax-filter--wrap">
        <div class="wp-ajax-filter">
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="category" data-query_val="animals">animals</button>
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="category" data-query_val="cats">cats</button>
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="category" data-query_val="dogs">dogs</button>
        </div>
    </div>
    <div class="wp-ajax-filter--wrap">
        <div class="wp-ajax-filter">
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="post_tag" data-query_val="lorem">lorem</button>
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="post_tag" data-query_val="ipsum">ipsum</button>
            <button class="wp-ajax-filter--option wp-ajax-filter--option-inactive" data-query_var="post_tag" data-query_val="set">set</button>
        </div>
    </div>
    <button class="wp-ajax-load">load more</button>
</div>
```
