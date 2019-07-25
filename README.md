## wp-ajax-boilerplate

Utilities for outputting and interacting with wp-query asynchronously

### Description

Use `[ajax]` shortcode to output a list of posts via wp_ajax_ hooks.

The `./public/js/wp-ajax-public.js` & `./public/class-wp-ajax-public.php` files are where the action happens.

The architecture of this plugin comes from [WordPress Plugin Boilerplate Generator](https://wppb.me/).

This plugin is an attempt at organizing and aggregating different techniques for running common WordPress queries asynchronously.

== ToDos ==

- Integrate wrapper data-atts with default state
- Add filters shortcode: select, radio, checkbox, to work in tandem with url-params for all filters
- Handle add/remove taxonomy terms - re-apply default terms if needed - consider multiple loops per page
- Could wrap filters shortcode in loop shortcode to constrain selectors

### End Goal

- Finish: post_type, multiple taxo & terms, orderby, & meta queries ajax-filters front & backend, then convert to blocks & add support for rest-api.
