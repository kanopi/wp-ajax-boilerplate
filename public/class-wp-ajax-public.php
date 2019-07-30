<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://kanopistudios.com
 * @since      1.0.0
 *
 * @package    Wp_Ajax
 * @subpackage Wp_Ajax/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Wp_Ajax
 * @subpackage Wp_Ajax/public
 * @author     Adam McFadyen & Damon Sharp <hello@kanopistudios.com>
 */
class Wp_Ajax_Public {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Wp_Ajax_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Wp_Ajax_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/wp-ajax-public.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Wp_Ajax_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Wp_Ajax_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		global $wp_query;

		// register our main script but do not enqueue it yet.
	 	// wp_register_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/wp-ajax-public.js', array( 'jquery' ), $this->version, false );
	 	wp_register_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/wp-ajax-public.js', array( 'jquery' ), date('Ymdhis'), false );

	 	// add php-vars to dom CDATA so JS can use.
	 	wp_localize_script( $this->plugin_name,  'wp_ajax_params', [
	 		'ajaxurl'        => site_url() . '/wp-admin/admin-ajax.php',
	 		'current_page'   => get_query_var( 'paged' ) ? get_query_var( 'paged' ) : 0,
	 		'max_page'       => $wp_query->max_num_pages,
	 		'the_ID'         => get_the_ID(),
	 	] );

		wp_enqueue_script( $this->plugin_name );

	}

	/**
	 * Add Wp Admin Ajax Hooks
	 *
	 * @since    1.0.0
	 */
	public function admin_ajax_handler() {

		// prepare our arguments for the query.
		$args = json_decode( stripslashes( $_POST['query'] ), true );

		$args['paged']       = $_POST['page'];
		$args['post_status'] = 'publish';
		// wp_send_json($args); die;

		// it is always better to use WP_Query but not here
		query_posts( $args );

		$return_json = (object) [];

		if ( have_posts() ) :

			global $wp_query;

			$index             = 1;
			$info              = (object) [];
			$info->found_posts = $wp_query->found_posts;
			$info->wp_query    = $wp_query;
			$return_json->info = $info;

			while ( have_posts() ) : the_post();
				$return_loop            = (object) [];
				$return_loop->index     = $index;
				$return_loop->the_id    = get_the_ID();
				$return_loop->the_title = get_the_title();

				$return_loop->the_permalink      = get_the_permalink();
				$return_loop->post_type          = get_post_type();
				$return_loop->has_post_thumbnail = has_post_thumbnail( get_the_ID() );
				$return_loop->the_excerpt        = wp_trim_words( get_the_excerpt(), 24, null );
				$return_loop->posted_date        = get_the_date();

				$thumbnail_url = get_the_post_thumbnail_url( get_the_ID(), 'thumbnail' );
				if ( empty( $thumbnail_url ) ) {
					$thumbnail_url = '';
				}

				$return_json->loop->$index = $return_loop;

				$index ++;
			endwhile;

		else:

			$info              = (object) [];
			$info->found_posts = 0;
			$info->wp_query    = null;
			$return_json->info = $info;

		endif;

		wp_send_json( $return_json );

		die;
	}

	/**
	 * Wp Ajax Shortcode
	 */
	function ajax_shortcode( $props, $content = null ) {

		$props = shortcode_atts( [ 'post_type' => false, 'taxo' => false, 'term' => false, 'meta' => false, 'key' => false, 'val' => false, ], $props, 'ajax' );
		$attrs = [ 'class' => 'wp-ajax-wrap' ];

		if ( ! empty( $props['post_type'] ) ) :
			$attrs[ 'post_type' ] = $props['post_type'];
		endif;

		if ( ! empty( $props['taxo'] ) && ! empty( $props['term'] ) ) :
			$attrs[ $props['taxo'] ] = $props['term'];
		endif;

		ob_start();
		// output attributes on wrapper, need nicer way to do this.
		if ( ! empty( $attrs ) ) :
			echo '<div';
			foreach ( $attrs as $att => $val ) :
				echo ' ' . esc_html( $att ) . '="' . esc_attr( $val ) . '"';
			endforeach;
			echo '>';
		else :
			echo '<div>';
		endif;

		if ( ! empty( $content ) ) :
			echo do_shortcode( $content );
		endif;
		?>
			<article class="wp-ajax-feed">JavaScript must be enabled to load content</article>
			<button class="wp-ajax-load">load more</button>
		<?php
		echo '</div>';
		return ob_get_clean();

	}

	/**
	 * Add Wp Ajax Shortcode
	 */
	public function add_ajax_shortcode() {
		add_shortcode('ajax',[$this,'ajax_shortcode']);
	}

	// one shortcode or many: 3 layouts: button / select-dropdown... 2 types: post-type, tax-query + meta-query too, but after infrastructure flushed out
	function ajax_filter_shortcode( $props ) {
		$props = shortcode_atts( [ 'ux' => 'select', 'post_type' => null, 'taxo' => null, 'taxo_term' => null, 'meta' => false, 'key' => false, 'val' => false, ], $props, 'ajax_filter' );

		// allowed post-types & terms applied here
		$post_types = explode( ',', $props['post_type'] ) );
		// todo: only allow specific post-types. check against user-intput &/or other specs
		if ( ! empty( $post_types ) {
			$post_types_list = [];
			foreach ( $post_types as $post_type ) {
				$post_types_list[] = $post_type;
			}
		}

		$taxo_terms = explode( ',', $props['taxo_term'] ) );
		if ( ! empty( $taxo_terms ) {
			$taxo_terms_list = [];
			foreach ( $taxo_terms as $taxo_term ) {
				$taxo_terms_list[] = $taxo_term;
			}
		}

		$output = '';
		ob_start();

			if ( 'select' === 'ux' ) {

				if ( ! empty( $post_types_list ) ) {
					$output .= '<option class="wp-ajax-filter">';
					foreach (  $post_types_list as $post_type ) {
						$output .= '<select class="wp-ajax-filter--option" data-queryvar="post_type" data-value="' .$post_type. '">' .$post_type. '</select>';
					}
					$output .= '</option>';
				}
				elseif ( ! empty( $props['taxo'] ) && ! empty( $taxo_terms_list ) ) {
					$output .= '<option class="wp-ajax-filter">';
					foreach (  $taxo_terms_list as $taxo_term ) {
						$output .= '<select class="wp-ajax-filter--option" data-taxo="' . esc_attr( $props['taxo'] ) . '" data-value="' .$taxo_term. '">' .$taxo_term. '</select>';
					}
					$output .= '</option>';
				}

			elseif ( 'buttons' === 'ux' ) {

				if ( ! empty( $post_types_list ) ) {
					$output .= '<div class="wp-ajax-filter">';
					foreach (  $post_types_list as $post_type ) {
						$output .= '<button class="wp-ajax-filter--option" data-queryvar="post_type" data-value="' .$post_type. '">' .$post_type. '</button>';
					}
					$output .= '</div>';
				}
				elseif ( ! empty( $props['taxo'] ) && ! empty( $taxo_terms_list ) ) {
					$output .= '<option class="wp-ajax-filter">';
					foreach (  $taxo_terms_list as $taxo_term ) {
						$output .= '<button class="wp-ajax-filter--option" data-taxo="' . esc_attr( $props['taxo'] ) . '" data-value="' .$taxo_term. '">' .$taxo_term. '</button>';
					}
					$output .= '</option>';
				}

			}
			//  ( 'pills' === 'ux' ) { }
			// elseif ( 'tag-list' === 'ux' ) { }
			// elseif ( 'checkbox' === 'ux' ) { }

			if ( ! empty( $output ) ) {
				echo echo '<div class="wp-ajax-filter">'.$output.'</div>';
			}

		return ob_get_clean();
	}
	public function add_ajax_filter_shortcode() {
		add_shortcode('ajax_filter',[$this,'ajax_filter_shortcode']);
	}

	/**
	 * Search Within a Taxonomy
	 *
	 * Support search with tax_query args
	 *
	 * $query = new WP_Query( array(
	 *  'search_tax_query' => true,
	 *  's' => $keywords,
	 *  'tax_query' => array( array(
	 *      'taxonomy' => 'country',
	 *      'field' => 'id',
	 *      'terms' => $country,
	 *  ) ),
	 * ) );
	 */
	public function taxosearch_groupby( $q ) {
		if ( is_admin() ) {
			return;
		}

		$wp_query_search_tax_query = filter_var( $q->get( 'search_tax_query' ), FILTER_VALIDATE_BOOLEAN );

		// WP_Query has 'tax_query', 's' and custom 'search_tax_query' argument passed.
		if ( $wp_query_search_tax_query && $q->get( 'tax_query' ) && $q->get( 's' ) ) {
			add_filter( 'posts_groupby', [ $this, 'taxosearch_posts_groupby' ], 10, 1 );
		}
	}

	public function taxosearch_posts_groupby( $groupby ) {
		return '';
	}

}
